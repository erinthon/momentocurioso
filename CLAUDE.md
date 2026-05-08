# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Backend:** Java 17, Spring Boot 3.3, Spring Security (JWT/stateless), Spring Data JPA, MySQL 8
- **Frontend:** Angular 20, standalone components, lazy-loaded feature modules
- **Database:** MySQL — `momentocurioso` (local dev), schema managed via `ddl-auto: update`

## Running locally

### Database (MySQL via Docker)
```bash
docker compose -f docker/docker-compose.yml up -d
```
Starts MySQL 8.4 on port 3306. Default credentials: user `mcuser` / password `mcpassword`, database `momentocurioso_dev`.

### Backend (from `backend/`)
```bash
mvn clean compile        # first time or after adding new resource files
mvn spring-boot:run
mvn test                 # run all tests
mvn test -Dtest=PostServiceImplTest          # run a single test class
mvn test -Dtest=PostServiceImplTest#methodName  # run a single test method
```
Runs on `http://localhost:8080/api`. Swagger UI at `http://localhost:8080/api/swagger-ui.html`.

### Frontend (from `frontend/`)
```bash
npm start                # ng serve → http://localhost:4200
npm test                 # Karma/Jasmine unit tests
npm run build            # production build to dist/
```

### IntelliJ
Use the **Full Stack** compound run configuration (launches both backend and frontend).

## Credentials / local config

The backend reads `backend/src/main/resources/application-local.yml` (gitignored) via `spring.config.import`. This file overrides `spring.datasource.password`. Copy the example to get started:

```bash
cp backend/src/main/resources/application-local.yml.example \
   backend/src/main/resources/application-local.yml
# then edit the password
```

After creating or modifying this file, run `mvn clean compile` so Maven copies it to `target/classes/`.

**Required env vars in dev** (set in `application-dev.yml` or `application-local.yml`):
- `JWT_SECRET` — any long random string for local dev
- `CLAUDE_API_KEY` — optional; only needed if using Claude as the active AI provider

## Backend architecture

All code lives under `com.momentocurioso`. The package layout follows a strict layered pattern:

```
controller/   → @RestController, request mapping, calls service
service/      → interfaces; service/impl/ → implementations
              → service/strategy/ → LLM provider strategies
repository/   → Spring Data JPA interfaces (extends JpaRepository)
entity/       → @Entity classes mapped to MySQL tables
dto/          → request/ and response/ records/classes (never expose entities directly)
config/       → Spring beans (SecurityConfig, CacheConfig, etc.)
exception/    → GlobalExceptionHandler (@RestControllerAdvice) handles all errors
security/     → JwtAuthFilter, JwtUtil
scheduler/    → ContentGenerationScheduler (runs every 6 h by default)
```

**Security:** stateless JWT. `SecurityConfig` permits `/api/auth/**`, `/v3/api-docs/**`, and `/swagger-ui/**`; everything else requires a valid Bearer token. CORS allows `http://localhost:4200` only (configurable via `CORS_ALLOWED_ORIGINS`). Rate limiting via Bucket4j (10 req/min on `/auth/**`).

**Error handling:** `GlobalExceptionHandler` handles `EntityNotFoundException` (404), `MethodArgumentNotValidException` (400 with field errors), and generic `Exception` (500). Add new `@ExceptionHandler` methods there — do not catch exceptions in controllers or services.

**JWT secret** for dev must be set via `JWT_SECRET` env var (see `application-dev.yml`). In prod it must come from the same env var.

**Response DTOs** use a static `from(Entity)` factory method — never construct them inline in controllers.

**Caching:** Caffeine in-memory cache is used in service impls. Invalidate on create/update/delete.

## Data model

Core entities and their key relationships:

- `Topic` — blog topic (has `active`, `autoPublish` flags; slug is unique)
- `SourceSite` → `Topic` — a crawl source (HTML or RSS/Atom) linked to a topic
- `ScrapedArticle` → `SourceSite` — raw article scraped from a source; has a `used` flag and `approvalStatus`: `PENDING → APPROVED / REJECTED`; approved articles can be `QUEUED` (with a `queuedProvider`) for manual AI generation
- `PromptTemplate` — configurable LLM prompt; only one can be `isDefault=true` at a time; uses `{{topic_name}}` and `{{articles}}` placeholders; `AiWriterServiceImpl` falls back to a hardcoded template if none is default
- `Post` → `Topic` — generated blog post; status: `DRAFT → PUBLISHED / REJECTED`
- `ContentGenerationJob` → `Topic`, optionally → `Post` — tracks a generation run
  - status lifecycle: `PENDING → RUNNING → DONE / FAILED`
  - triggered by `SCHEDULER` or `MANUAL`
- `AiProvider` — configured LLM provider (type: `CLAUDE`, `OPENAI`, `OPENAI_COMPATIBLE`); only one is `active` at a time
- `User` — application users with `Role` (`USER` / `ADMIN`)

## Content generation pipeline

`ContentGenerationScheduler` orchestrates the full pipeline (runs every 6 h, configurable via `scheduler.content-generation.delay-ms`):

1. Fetch active topics
2. For each topic: scrape `SourceSite`s via `ContentFetcherService` (Jsoup for HTML, Rome for RSS/Atom)
3. Pass unused `ScrapedArticle`s to `AiWriterService`
4. `AiWriterService` selects the active `AiProvider` and delegates to the matching `LlmStrategy` via `LlmStrategyFactory`
5. The strategy calls the LLM API and parses the JSON response into `AiGeneratedContent { title, summary, content }`
6. `PostService.saveDraft()` persists the post; if `topic.autoPublish` is true the post is published immediately
7. Articles are marked as `used`; the job is marked `DONE` or `FAILED`

`AiWriterServiceImpl` caps input at `MAX_ARTICLES = 5` articles and `MAX_CONTENT_CHARS = 500` characters per article before building the prompt.

Manual trigger: `POST /api/admin/content/trigger` with `{ "topicId": N }`.

**Public RSS feed:** `GET /api/feed.xml?topicSlug=<slug>` — returns an RSS 2.0 feed of published posts. The `topicSlug` param is optional (omit for all topics). No auth required.

## Scraped article approval & manual generation

Scraped articles enter with `approvalStatus=PENDING`. Admin workflow:

1. `PATCH /admin/scraped-articles/{id}/approve` or `/reject` — curate articles
2. `PATCH /admin/scraped-articles/{id}/queue` with `{ "aiProviderId": N }` — queue approved articles for a specific provider
3. `POST /admin/ai-writer/generate` with selected article IDs — triggers generation for the queued batch

`AiWriterQueueService` manages the queue state for articles pending manual generation (separate from the scheduler flow).

**Mock mode:** if no `AiProvider` is `active`, `AiWriterServiceImpl.generate()` silently returns placeholder content (title prefixed `[MOCK]`) instead of calling any LLM. This is intentional for local dev without API keys.

## LLM strategy pattern

`LlmStrategy` interface with three implementations in `service/strategy/`:
- `ClaudeStrategy` — Anthropic Claude API (default model: `claude-sonnet-4-6`, configured in `application-dev.yml` via `claude.model`)
- `OpenAiStrategy` — OpenAI
- `OpenAiCompatibleStrategy` — any OpenAI-compatible endpoint (set `baseUrl` on the `AiProvider`)

`LlmStrategyFactory` selects the correct strategy from the active `AiProvider`. All strategies parse the LLM response via `LlmStrategy.parseContent()`, which strips markdown fences and parses the JSON payload.

## Frontend architecture

```
src/app/
  core/            → singleton services, guards, interceptors (never import in features)
  shared/          → reusable components, pipes, directives
  features/        → one folder per domain feature, each with its own *.routes.ts
```

**Route tree:**
```
/blog/posts          → public post list (no auth)
/blog/posts/:slug    → public post detail (no auth)
/auth/login          → login page
/home                → protected (authGuard)
/admin               → protected (adminGuard — checks ADMIN role)
  /admin/topics
  /admin/posts
  /admin/jobs
  /admin/trigger
  /admin/providers
  /admin/scraped-articles   → approve/reject/queue scraped articles
  /admin/ai-writer          → manual AI generation queue
  /admin/prompt-templates   → manage prompt templates
```

**HTTP:** all API calls go through `ApiService` (`core/services/api.service.ts`), which wraps `HttpClient` with the base URL from `environment.apiUrl`. The `authInterceptor` automatically attaches the Bearer token from `localStorage` to every outgoing request.

**Environments:** `environment.ts` → `http://localhost:8080/api`; `environment.prod.ts` → `/api`.

## Testing conventions

- **Controller tests** (`test/controller/`) — use `@WebMvcTest(XController.class)` + `MockMvc`. Mock all service and security dependencies with `@MockBean`.
- **Service tests** (`test/service/`) — use `@ExtendWith(MockitoExtension.class)` + `@InjectMocks` / `@Mock`. No Spring context.
- Both layers use AssertJ (`assertThat`) and Mockito (`when`, `verify`).

## Adding a new feature (typical flow)

1. **Entity** → `entity/` with `@Entity`, `@Table`, Lombok `@Getter @Setter`
2. **Repository** → `repository/` extending `JpaRepository<Entity, Long>`
3. **DTOs** → `dto/request/` and `dto/response/` (use Java records; add `from()` on response DTOs)
4. **Service interface + impl** → `service/` and `service/impl/`
5. **Controller** → `controller/` with `@RestController`, `@RequestMapping("/resource")`
6. **Frontend feature** → `features/<name>/` with component + `<name>.routes.ts`, registered in `app.routes.ts`
