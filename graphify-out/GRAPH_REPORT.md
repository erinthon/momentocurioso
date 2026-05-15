# Graph Report - C:/dev/momentocurioso  (2026-05-08)

## Corpus Check
- Corpus is ~43,067 words - fits in a single context window. You may not need a graph.

## Summary
- 884 nodes · 1130 edges · 97 communities (53 shown, 44 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 152 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Posts & Scraped Content Core|Posts & Scraped Content Core]]
- [[_COMMUNITY_Auth & User Management|Auth & User Management]]
- [[_COMMUNITY_AI Writing & LLM Strategies|AI Writing & LLM Strategies]]
- [[_COMMUNITY_AI Writer Queue & Job Testing|AI Writer Queue & Job Testing]]
- [[_COMMUNITY_Content Scraping & Scheduling|Content Scraping & Scheduling]]
- [[_COMMUNITY_Angular App Shell|Angular App Shell]]
- [[_COMMUNITY_Security Filters & Prompt Templates|Security Filters & Prompt Templates]]
- [[_COMMUNITY_Backend Architecture Concepts|Backend Architecture Concepts]]
- [[_COMMUNITY_Exception Handling & Admin Tests|Exception Handling & Admin Tests]]
- [[_COMMUNITY_Topic Management|Topic Management]]
- [[_COMMUNITY_Config & AI Content DTOs|Config & AI Content DTOs]]
- [[_COMMUNITY_Source Site Management|Source Site Management]]
- [[_COMMUNITY_RSS Feed & Post Repository|RSS Feed & Post Repository]]
- [[_COMMUNITY_Angular Scraped Articles UI|Angular Scraped Articles UI]]
- [[_COMMUNITY_AI Provider Management|AI Provider Management]]
- [[_COMMUNITY_Angular Admin Posts UI|Angular Admin Posts UI]]
- [[_COMMUNITY_Angular Topics Admin UI|Angular Topics Admin UI]]
- [[_COMMUNITY_Blog Post Detail View|Blog Post Detail View]]
- [[_COMMUNITY_Blog Post List View|Blog Post List View]]
- [[_COMMUNITY_Prompt Template Tests|Prompt Template Tests]]
- [[_COMMUNITY_Post Service Interface|Post Service Interface]]
- [[_COMMUNITY_Security Config & CORS|Security Config & CORS]]
- [[_COMMUNITY_Manual Trigger UI|Manual Trigger UI]]
- [[_COMMUNITY_Blog Navigation & Theme|Blog Navigation & Theme]]
- [[_COMMUNITY_Content Fetcher Tests|Content Fetcher Tests]]
- [[_COMMUNITY_AI Providers Admin UI|AI Providers Admin UI]]
- [[_COMMUNITY_Frontend Prompt Templates|Frontend Prompt Templates]]
- [[_COMMUNITY_Topic Service Interface|Topic Service Interface]]
- [[_COMMUNITY_AI Writer Admin UI|AI Writer Admin UI]]
- [[_COMMUNITY_Admin Jobs UI|Admin Jobs UI]]
- [[_COMMUNITY_Admin Prompt Templates UI|Admin Prompt Templates UI]]
- [[_COMMUNITY_Admin Navigation UI|Admin Navigation UI]]
- [[_COMMUNITY_Job Service Interface|Job Service Interface]]
- [[_COMMUNITY_Prompt Template Service Interface|Prompt Template Service Interface]]
- [[_COMMUNITY_Scraped Article Service Interface|Scraped Article Service Interface]]
- [[_COMMUNITY_AI Writer Data Types|AI Writer Data Types]]
- [[_COMMUNITY_Scraped Articles Data Types|Scraped Articles Data Types]]
- [[_COMMUNITY_AI Provider Service Interface|AI Provider Service Interface]]
- [[_COMMUNITY_Source Site Service Interface|Source Site Service Interface]]
- [[_COMMUNITY_Rate Limit Filter Tests|Rate Limit Filter Tests]]
- [[_COMMUNITY_Content Fetcher Service Interface|Content Fetcher Service Interface]]
- [[_COMMUNITY_Scheduler Tests|Scheduler Tests]]
- [[_COMMUNITY_Admin Posts Data Types|Admin Posts Data Types]]
- [[_COMMUNITY_Admin Jobs Data Types|Admin Jobs Data Types]]
- [[_COMMUNITY_PromptTemplate Entity|PromptTemplate Entity]]
- [[_COMMUNITY_AI Queue Service Interface|AI Queue Service Interface]]
- [[_COMMUNITY_AI Writer Service Interface|AI Writer Service Interface]]
- [[_COMMUNITY_LLM Strategy Factory|LLM Strategy Factory]]
- [[_COMMUNITY_Frontend API Service|Frontend API Service]]
- [[_COMMUNITY_Cache Configuration|Cache Configuration]]
- [[_COMMUNITY_AiProvider Entity|AiProvider Entity]]
- [[_COMMUNITY_Post Entity|Post Entity]]
- [[_COMMUNITY_RSS Feed Service Interface|RSS Feed Service Interface]]
- [[_COMMUNITY_App Context Tests|App Context Tests]]
- [[_COMMUNITY_Frontend Environment Config|Frontend Environment Config]]
- [[_COMMUNITY_ContentGenerationJob Entity|ContentGenerationJob Entity]]
- [[_COMMUNITY_ScrapedArticle Entity|ScrapedArticle Entity]]
- [[_COMMUNITY_SourceSite Entity|SourceSite Entity]]
- [[_COMMUNITY_Topic Entity|Topic Entity]]
- [[_COMMUNITY_User Entity|User Entity]]
- [[_COMMUNITY_Admin Routes|Admin Routes]]
- [[_COMMUNITY_Prompt Template Routes|Prompt Template Routes]]
- [[_COMMUNITY_Auth Routes|Auth Routes]]
- [[_COMMUNITY_Blog Routes|Blog Routes]]
- [[_COMMUNITY_Home Routes|Home Routes]]
- [[_COMMUNITY_Production Environment Config|Production Environment Config]]
- [[_COMMUNITY_User Entity Concept|User Entity Concept]]

## God Nodes (most connected - your core abstractions)
1. `AdminScrapedArticlesComponent` - 20 edges
2. `AdminPostsComponent` - 19 edges
3. `ApiService` - 18 edges
4. `AdminTopicsComponent` - 18 edges
5. `PostServiceImpl` - 14 edges
6. `AuthService` - 14 edges
7. `PromptTemplateServiceTest` - 13 edges
8. `AdminPostController` - 11 edges
9. `PostService` - 11 edges
10. `PostListComponent` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Spring Boot Backend` --references--> `application.yml (base Spring config)`  [INFERRED]
  CLAUDE.md → backend/src/main/resources/application.yml
- `Favicon SVG (globe/leaf cluster symbol, green)` --references--> `Green Theme Color Palette (#0a7c38)`  [EXTRACTED]
  frontend/public/favicon.svg → brand-guide/brand-guide-v3.html
- `Claude Model (claude-sonnet-4-6)` --references--> `ClaudeStrategy (Anthropic Claude API)`  [INFERRED]
  backend/src/main/resources/application-dev.yml → CLAUDE.md
- `app.html (router-outlet root template)` --references--> `Angular 20 Frontend SPA`  [EXTRACTED]
  frontend/src/app/app.html → CLAUDE.md
- `application-dev.yml (dev profile config)` --references--> `JWT_SECRET Env Variable`  [EXTRACTED]
  backend/src/main/resources/application-dev.yml → CLAUDE.md

## Hyperedges (group relationships)
- **Content Generation Pipeline (Scheduler â†’ Fetcher â†’ AiWriter â†’ PostService)** — service_content_generation_scheduler, service_content_fetcher, service_ai_writer, service_post, entity_content_generation_job [EXTRACTED 1.00]
- **LLM Strategy Pattern (Factory selects Claude/OpenAI/Compatible)** — service_llm_strategy_factory, strategy_claude, strategy_openai, strategy_openai_compatible, entity_ai_provider [EXTRACTED 1.00]
- **Spring Security Stack (JWT + Rate Limiting + CORS)** — backend_security_config, backend_jwt_auth, backend_bucket4j_ratelimit, frontend_auth_interceptor [INFERRED 0.85]

## Communities (97 total, 44 thin omitted)

### Community 0 - "Posts & Scraped Content Core"
Cohesion: 0.06
Nodes (9): ContentGenerationJobService, PublicPostController, ContentGenerationJobServiceImpl, PostServiceImpl, ScrapedArticleServiceImpl, PostService, ContentGenerationJobRepository, ScrapedArticleService (+1 more)

### Community 1 - "Auth & User Management"
Cohesion: 0.07
Nodes (7): AuthController, AuthControllerTest, UserServiceImpl, UserRepository, JwtUtil, JwtUtilTest, UserService

### Community 2 - "AI Writing & LLM Strategies"
Cohesion: 0.06
Nodes (10): AiWriterService, PublicPostControllerTest, AiWriterServiceImpl, LlmStrategy, PromptTemplateRepository, AiWriterServiceTest, ClaudeStrategy, LlmStrategy (+2 more)

### Community 3 - "AI Writer Queue & Job Testing"
Cohesion: 0.06
Nodes (6): AdminPostController, AdminScrapedArticleController, GenerateFromQueueRequest, from(), AiWriterQueueServiceImplTest, ClaudeStrategyTest

### Community 4 - "Content Scraping & Scheduling"
Cohesion: 0.06
Nodes (9): AiWriterQueueService, ContentFetcherService, AdminAiWriterController, AdminAiWriterControllerTest, AiWriterQueueServiceImpl, ContentFetcherServiceImpl, ScrapedArticleRepository, SourceSiteRepository (+1 more)

### Community 5 - "Angular App Shell"
Cohesion: 0.07
Nodes (14): App, appConfig, routes, compiled, fixture, adminGuard(), authGuard(), HomeComponent (+6 more)

### Community 6 - "Security Filters & Prompt Templates"
Cohesion: 0.08
Nodes (8): AdminPromptTemplateController, PromptTemplateServiceImpl, OncePerRequestFilter, PromptTemplateService, JwtAuthFilter, RateLimitFilter, UserService, UserDetailsService

### Community 7 - "Backend Architecture Concepts"
Cohesion: 0.08
Nodes (33): Bucket4j Rate Limiting (/auth/** 10 req/min), Caffeine In-Memory Cache, Controller Layer (@RestController), DTO Layer (request/response records), Entity Layer (@Entity, MySQL tables), GlobalExceptionHandler (@RestControllerAdvice), JWT Authentication (JwtAuthFilter, JwtUtil), Repository Layer (JpaRepository) (+25 more)

### Community 8 - "Exception Handling & Admin Tests"
Cohesion: 0.09
Nodes (3): AdminPostControllerTest, AdminPromptTemplateControllerTest, GlobalExceptionHandler

### Community 9 - "Topic Management"
Cohesion: 0.08
Nodes (5): TopicController, TopicServiceImpl, MomentoCuriosoApplication, TopicRepository, TopicService

### Community 10 - "Config & AI Content DTOs"
Cohesion: 0.1
Nodes (27): AiGeneratedContent (title, summary, content), application-dev.yml (dev profile config), application-local.yml (gitignored local secrets), application-prod.yml (prod profile, env vars only), application.yml (base Spring config), Claude Model (claude-sonnet-4-6), docker-compose.yml (MySQL dev container), CLAUDE_API_KEY Env Variable (+19 more)

### Community 11 - "Source Site Management"
Cohesion: 0.11
Nodes (4): SourceSiteController, SourceSiteControllerTest, SourceSiteServiceImpl, SourceSiteService

### Community 12 - "RSS Feed & Post Repository"
Cohesion: 0.12
Nodes (4): RssFeedController, RssFeedServiceImpl, PostRepository, RssFeedService

### Community 14 - "AI Provider Management"
Cohesion: 0.11
Nodes (4): AiProviderService, AdminAiProviderController, AiProviderServiceImpl, AiProviderRepository

### Community 17 - "Blog Post Detail View"
Cohesion: 0.12
Nodes (9): PostDetailComponent, article, compiled, MOCK_POST, req, scripts, spy, structuredPost (+1 more)

### Community 18 - "Blog Post List View"
Cohesion: 0.13
Nodes (6): PostListComponent, EMPTY_PAGE, MOCK_POSTS_PAGE, MOCK_TOPICS, postsReq, topicsReq

### Community 22 - "Manual Trigger UI"
Cohesion: 0.2
Nodes (4): AdminTriggerComponent, JobResult, JobStatus, Topic

### Community 23 - "Blog Navigation & Theme"
Cohesion: 0.24
Nodes (6): BlogNavbarComponent, PostDetail, PagedPosts, PostSummary, Topic, Theme

### Community 31 - "Admin Navigation UI"
Cohesion: 0.32
Nodes (4): AdminNavbarComponent, AiProvider, Source, Topic

### Community 35 - "AI Writer Data Types"
Cohesion: 0.29
Nodes (6): AiProvider, GenerationResult, JobStatusResponse, PageResponse, QueuedArticle, TopicGroup

### Community 36 - "Scraped Articles Data Types"
Cohesion: 0.29
Nodes (6): AiProvider, ApprovalStatus, PageResponse, ScrapedArticle, SourceSite, Topic

### Community 42 - "Admin Posts Data Types"
Cohesion: 0.4
Nodes (4): AdminPost, AdminPostDetail, PageResponse, PostStatus

### Community 43 - "Admin Jobs Data Types"
Cohesion: 0.4
Nodes (4): Job, JobStatus, PageResponse, TriggerSource

## Knowledge Gaps
- **74 isolated node(s):** `ContentGenerationJob`, `ScrapedArticle`, `SourceSite`, `Topic`, `User` (+69 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiService` connect `Frontend API Service` to `AI Writing & LLM Strategies`, `AI Writer Data Types`, `Scraped Articles Data Types`, `Angular App Shell`, `Exception Handling & Admin Tests`, `Admin Posts Data Types`, `Admin Jobs Data Types`, `Blog Navigation & Theme`, `Frontend Environment Config`, `Manual Trigger UI`, `Frontend Prompt Templates`, `Admin Navigation UI`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **Why does `AdminPromptTemplatesComponent` connect `Admin Prompt Templates UI` to `Posts & Scraped Content Core`, `Frontend Prompt Templates`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `PostServiceImpl` connect `Posts & Scraped Content Core` to `RSS Feed & Post Repository`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `ContentGenerationJob`, `ScrapedArticle`, `SourceSite` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Posts & Scraped Content Core` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Auth & User Management` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `AI Writing & LLM Strategies` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._