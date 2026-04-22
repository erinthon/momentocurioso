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

## Backend architecture

All code lives under `com.momentocurioso`. The package layout follows a strict layered pattern:

```
controller/   → @RestController, request mapping, calls service
service/      → interfaces; service/impl/ → implementations
repository/   → Spring Data JPA interfaces (extends JpaRepository)
entity/       → @Entity classes mapped to MySQL tables
dto/          → request/ and response/ records/classes (never expose entities directly)
config/       → Spring beans (SecurityConfig, etc.)
exception/    → GlobalExceptionHandler (@RestControllerAdvice) handles all errors
security/     → JWT filter and utilities (to be added)
```

**Security:** stateless JWT. `SecurityConfig` permits `/api/auth/**`, `/v3/api-docs/**`, and `/swagger-ui/**`; everything else requires a valid Bearer token. CORS is configured to allow `http://localhost:4200` only.

**Error handling:** `GlobalExceptionHandler` already handles `EntityNotFoundException` (404), `MethodArgumentNotValidException` (400 with field errors), and generic `Exception` (500). Add new `@ExceptionHandler` methods there — do not catch exceptions in controllers or services.

**JWT secret** for dev is a hardcoded default in `application-dev.yml`. In prod it must come from the `JWT_SECRET` env var.

## Frontend architecture

```
src/app/
  core/            → singleton services, guards, interceptors (never import in features)
  shared/          → reusable components, pipes, directives
  features/        → one folder per domain feature, each with its own *.routes.ts
```

**Routing:** all feature routes are lazy-loaded via `loadChildren`. Protected routes use `authGuard` (checks `localStorage` for `token`). New features go in `features/` with their own route file, registered in `app.routes.ts`.

**HTTP:** all API calls go through `ApiService` (`core/services/api.service.ts`), which wraps `HttpClient` with the base URL from `environment.apiUrl`. The `authInterceptor` automatically attaches the Bearer token from `localStorage` to every outgoing request.

**Environments:** `environment.ts` points to `http://localhost:8080/api`; `environment.prod.ts` uses the relative path `/api`.

## Adding a new feature (typical flow)

1. **Entity** → `entity/` with `@Entity`, `@Table`, Lombok `@Getter @Setter`
2. **Repository** → `repository/` extending `JpaRepository<Entity, Long>`
3. **DTOs** → `dto/request/` and `dto/response/` (use Java records)
4. **Service interface + impl** → `service/` and `service/impl/`
5. **Controller** → `controller/` with `@RestController`, `@RequestMapping("/resource")`
6. **Frontend feature** → `features/<name>/` with component + `<name>.routes.ts`, registered in `app.routes.ts`
