# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Backend:** Java 17, Spring Boot 3.3, Spring Security (JWT/stateless), Spring Data JPA, MySQL 8
- **Frontend:** Angular 20, standalone components, lazy-loaded feature modules
- **Database:** MySQL — `momentocurioso` (local dev), schema managed via `ddl-auto: update`

## Running locally

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
- `ScrapedArticle` → `Topic` — raw article scraped from a source; has a `used` flag
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

Manual trigger: `POST /api/admin/content/trigger` with `{ "topicId": N }`.

## LLM strategy pattern

`LlmStrategy` interface with three implementations in `service/strategy/`:
- `ClaudeStrategy` — Anthropic Claude API
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
```

**HTTP:** all API calls go through `ApiService` (`core/services/api.service.ts`), which wraps `HttpClient` with the base URL from `environment.apiUrl`. The `authInterceptor` automatically attaches the Bearer token from `localStorage` to every outgoing request.

**Environments:** `environment.ts` → `http://localhost:8080/api`; `environment.prod.ts` → `/api`.

## Adding a new feature (typical flow)

1. **Entity** → `entity/` with `@Entity`, `@Table`, Lombok `@Getter @Setter`
2. **Repository** → `repository/` extending `JpaRepository<Entity, Long>`
3. **DTOs** → `dto/request/` and `dto/response/` (use Java records; add `from()` on response DTOs)
4. **Service interface + impl** → `service/` and `service/impl/`
5. **Controller** → `controller/` with `@RestController`, `@RequestMapping("/resource")`
6. **Frontend feature** → `features/<name>/` with component + `<name>.routes.ts`, registered in `app.routes.ts`
