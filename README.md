# Momento Curioso

AI-powered blog that automatically generates and publishes articles on configurable topics.

## What it does

A scheduled pipeline fetches content from RSS feeds and HTML pages, sends it to the Claude API, and generates draft articles in Portuguese. Admins review and publish drafts through a back-office panel.

## Stack

- **Backend:** Java 17, Spring Boot 3.3, Spring Security (JWT/stateless), Spring Data JPA, MySQL 8
- **Frontend:** Angular 20, standalone components, lazy-loaded feature modules

## Key features

- Topic and source-site management (RSS + HTML scraping via Rome + Jsoup)
- AI content generation via Claude API (`claude-3-5-haiku`)
- Scheduler runs every 6 h; manual trigger available from admin panel
- JWT authentication with role-based access (ADMIN / USER)
- In-memory cache (Caffeine) on public endpoints
- Rate limiting on `/auth/**` via Bucket4j (10 req/min per IP)

## Project layout

```
backend/   → Spring Boot API (port 8080, base path /api)
frontend/  → Angular SPA (port 4200)
```

## Running locally

```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend
cd frontend && npm start
```

Requires `backend/src/main/resources/application-local.yml` with DB credentials (see `application-local.yml.example`).

Full setup details in [CLAUDE.md](CLAUDE.md).
