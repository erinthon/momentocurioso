import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface PagedPosts {
  content: PostSummary[];
  totalElements: number;
  totalPages: number;
  last: boolean;
}
import { ApiService } from '../../../core/services/api.service';
import { BlogNavbarComponent } from '../../../shared/blog-navbar/blog-navbar.component';

interface PostSummary {
  id: number;
  title: string;
  slug: string;
  summary: string;
  topicSlug: string;
  publishedAt: string;
}

interface Topic {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterLink, BlogNavbarComponent],
  styles: [`
    /* ── Hero ── */
    .hero {
      position: relative;
      padding: 80px 2rem 64px;
      background: var(--bg-1);
      border-bottom: 1px solid var(--border);
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -120px;
      right: -80px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(10,124,56,.12) 0%, transparent 65%);
      pointer-events: none;
    }
    .hero-inner {
      position: relative;
      max-width: 860px;
    }
    .hero-eyebrow {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .hero-eyebrow-line {
      width: 32px;
      height: 2px;
      background: var(--green);
      flex-shrink: 0;
    }
    .hero-eyebrow-text {
      font-family: var(--fu);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--text-3);
    }
    .hero-lockup {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      margin-bottom: 20px;
    }
    .hero-title {
      font-family: var(--fd);
      font-weight: 800;
      font-size: clamp(38px, 5.5vw, 64px);
      color: var(--text);
      letter-spacing: -2.5px;
      line-height: 1.05;
      margin: 0;
    }
    .hero-title em {
      font-style: normal;
      color: var(--green);
    }
    .hero-globe {
      flex-shrink: 0;
      pointer-events: none;
      margin-bottom: 4px;
    }
    .hero-sub {
      font-family: var(--fb);
      font-size: 17px;
      color: var(--text-3);
      line-height: 1.65;
      max-width: 520px;
    }
    @media (max-width: 600px) {
      .hero-lockup { gap: 12px; }
      .hero-globe svg { width: 72px; height: 72px; }
    }

    /* ── Filter bar ── */
    .filter-bar {
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      padding: 16px 2rem;
      overflow-x: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .filter-inner {
      display: flex;
      gap: 8px;
      min-width: max-content;
    }
    .topic-btn {
      font-family: var(--fu);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: .04em;
      color: var(--text-3);
      background: var(--bg-1);
      border: 1px solid var(--border);
      border-radius: 40px;
      padding: 8px 18px;
      cursor: pointer;
      transition: all var(--t);
      white-space: nowrap;
      &:hover { background: var(--green-pale); color: var(--green); border-color: var(--green); }
      &.active { background: var(--green); color: #fff; border-color: var(--green); }
    }

    /* ── Posts section ── */
    .posts-section {
      padding: 48px 2rem 80px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 40px;
    }
    .section-label {
      font-family: var(--fu);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .16em;
      color: var(--text-3);
      text-transform: uppercase;
    }
    .section-count {
      font-family: var(--fu);
      font-size: 11px;
      color: var(--text-4);
      letter-spacing: .06em;
    }

    /* ── Featured card ── */
    .featured-card {
      display: grid;
      grid-template-columns: 280px 1fr;
      background: var(--bg-1);
      border: 1px solid var(--border);
      border-left: 4px solid var(--green);
      border-radius: var(--rl);
      overflow: hidden;
      cursor: pointer;
      transition: box-shadow var(--t), transform var(--t);
      margin-bottom: 36px;
      text-decoration: none;
      color: inherit;
      &:hover { box-shadow: var(--shadow-lg); transform: translateY(-4px); }
    }
    .featured-thumb {
      background: linear-gradient(135deg, var(--bg-2), var(--bg-3));
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .featured-thumb-icon { opacity: .35; }
    .featured-content {
      padding: 32px 36px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 12px;
    }
    .featured-label {
      font-family: var(--fu);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--green);
    }
    .featured-title {
      font-family: var(--fd);
      font-weight: 800;
      font-size: 26px;
      color: var(--text);
      letter-spacing: -.7px;
      line-height: 1.2;
    }
    .featured-summary {
      font-family: var(--fb);
      font-size: 15px;
      color: var(--text-3);
      line-height: 1.65;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .featured-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }
    .card-date {
      font-family: var(--fu);
      font-size: 11px;
      color: var(--text-4);
    }
    .card-cta {
      font-family: var(--fu);
      font-size: 12px;
      font-weight: 600;
      color: var(--green);
      letter-spacing: .04em;
      opacity: 0;
      transition: opacity var(--t);
    }
    .featured-card:hover .card-cta,
    .post-card:hover .card-cta { opacity: 1; }

    /* ── Cards grid ── */
    .posts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    @media (max-width: 960px) {
      .posts-grid { grid-template-columns: repeat(2, 1fr); }
      .featured-card { grid-template-columns: 1fr; }
      .featured-thumb { min-height: 160px; }
    }
    @media (max-width: 600px) {
      .posts-grid { grid-template-columns: 1fr; }
      .hero { padding: 56px 1rem 44px; }
      .filter-bar { padding: 12px 1rem; }
      .posts-section { padding: 32px 1rem 60px; }
    }

    .post-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-1);
      border: 1px solid var(--border);
      border-radius: var(--r);
      overflow: hidden;
      cursor: pointer;
      transition: border-color var(--t), box-shadow var(--t), transform var(--t);
      text-decoration: none;
      color: inherit;
      &:hover { border-color: var(--green); box-shadow: var(--shadow-lg); transform: translateY(-4px); }
    }
    .card-thumb {
      height: 140px;
      background: linear-gradient(135deg, var(--bg-2), var(--bg-3));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .card-thumb-icon { opacity: .3; }
    .card-body {
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }
    .card-title {
      font-family: var(--fd);
      font-weight: 700;
      font-size: 18px;
      color: var(--text);
      letter-spacing: -.4px;
      line-height: 1.25;
    }
    .card-summary {
      font-family: var(--fb);
      font-size: 13px;
      color: var(--text-3);
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 4px;
    }

    /* ── States ── */
    .state-empty, .state-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 80px 0;
      text-align: center;
    }
    .state-empty p, .state-loading p {
      font-family: var(--fu);
      font-size: 13px;
      color: var(--text-4);
      letter-spacing: .08em;
    }
    .pulse-bar {
      width: 40px;
      height: 3px;
      background: var(--green);
      border-radius: 2px;
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { width: 40px; opacity: 1; }
      50% { width: 70px; opacity: .4; }
    }
    .load-more-wrap {
      display: flex;
      justify-content: center;
      padding: 2.5rem 0 1rem;
    }
    .btn-load-more {
      padding: .65rem 2rem;
      background: transparent;
      border: 1.5px solid var(--green);
      color: var(--green);
      border-radius: var(--r);
      font-family: var(--ff);
      font-size: .9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .18s, color .18s;
      min-width: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
    }
    .btn-load-more:hover:not(:disabled) {
      background: var(--green);
      color: #fff;
    }
    .btn-load-more:disabled { opacity: .5; cursor: default; }
  `],
  template: `
    <app-blog-navbar />

    <header class="hero">
      <div class="hero-inner">
        <div class="hero-eyebrow">
          <span class="hero-eyebrow-line"></span>
          <span class="hero-eyebrow-text">Blog · IA Editorial</span>
        </div>
        <div class="hero-lockup">
          <h1 class="hero-title">
            Mate a sua<br/><em>curiosidade.</em>
          </h1>
          <div class="hero-globe">
            <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
              <circle cx="54" cy="50" r="36" stroke="var(--green)" stroke-width="5.5"/>
              <ellipse cx="44" cy="40" rx="10" ry="13" fill="var(--green)" transform="rotate(-15 44 40)"/>
              <ellipse cx="62" cy="37" rx="8" ry="10" fill="var(--green)" transform="rotate(10 62 37)"/>
              <ellipse cx="35" cy="56" rx="7" ry="9" fill="var(--green)" transform="rotate(-5 35 56)"/>
              <ellipse cx="64" cy="55" rx="6" ry="7" fill="var(--green)" transform="rotate(5 64 55)"/>
              <line x1="54" y1="86" x2="54" y2="103" stroke="var(--green)" stroke-width="5.5" stroke-linecap="round"/>
              <line x1="38" y1="103" x2="70" y2="103" stroke="var(--green)" stroke-width="5.5" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
        <p class="hero-sub">
          Conteúdo gerado por inteligência artificial sobre o que há de mais fascinante no mundo.
        </p>
      </div>
    </header>

    <div class="filter-bar">
      <div class="filter-inner">
        <button
          class="topic-btn"
          [class.active]="!activeTopicSlug"
          (click)="setFilter(null)">
          Todos
        </button>
        <button
          *ngFor="let t of topics"
          class="topic-btn"
          [class.active]="activeTopicSlug === t.slug"
          (click)="setFilter(t.slug)">
          {{ t.name }}
        </button>
      </div>
    </div>

    <main class="posts-section">
      <div class="section-header">
        <span class="sep-short"></span>
        <span class="section-label">{{ activeTopicSlug ? getTopicName(activeTopicSlug) : 'Todos os posts' }}</span>
        <span class="section-count" *ngIf="!loading">{{ totalElements }} {{ totalElements === 1 ? 'post' : 'posts' }}</span>
      </div>

      <div *ngIf="loading" class="state-loading">
        <span class="pulse-bar"></span>
        <p>Carregando posts...</p>
      </div>

      <div *ngIf="!loading && posts.length === 0" class="state-empty">
        <span class="sep-short"></span>
        <p>Nenhum post publicado ainda</p>
      </div>

      <ng-container *ngIf="!loading && posts.length > 0">
        <a class="featured-card rv d1" [routerLink]="['/blog/posts', posts[0].slug]">
          <div class="featured-thumb">
            <svg class="featured-thumb-icon" width="56" height="56" viewBox="0 0 120 120" fill="none">
              <circle cx="54" cy="50" r="36" stroke="var(--green)" stroke-width="5.5"/>
              <ellipse cx="44" cy="40" rx="10" ry="13" fill="var(--green)" transform="rotate(-15 44 40)"/>
              <ellipse cx="62" cy="37" rx="8" ry="10" fill="var(--green)" transform="rotate(10 62 37)"/>
              <ellipse cx="35" cy="56" rx="7" ry="9" fill="var(--green)" transform="rotate(-5 35 56)"/>
              <ellipse cx="64" cy="55" rx="6" ry="7" fill="var(--green)" transform="rotate(5 64 55)"/>
              <path d="M18 50 Q54 64 90 50" stroke="var(--bg)" stroke-width="2.5" fill="none"/>
              <path d="M38 85 Q54 93 70 85" stroke="var(--green)" stroke-width="5.5" fill="none" stroke-linecap="round"/>
              <line x1="54" y1="86" x2="54" y2="103" stroke="var(--green)" stroke-width="5.5" stroke-linecap="round"/>
              <line x1="38" y1="103" x2="70" y2="103" stroke="var(--green)" stroke-width="5.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="featured-content">
            <span class="featured-label">Destaque</span>
            <div><span class="tag tag-green">{{ getTopicName(posts[0].topicSlug) }}</span></div>
            <h2 class="featured-title">{{ posts[0].title }}</h2>
            <p class="featured-summary">{{ posts[0].summary }}</p>
            <div class="featured-footer">
              <time class="card-date">{{ formatDate(posts[0].publishedAt) }}</time>
              <span class="card-cta">Ler artigo →</span>
            </div>
          </div>
        </a>

        <div *ngIf="posts.length > 1" class="posts-grid">
          <a
            *ngFor="let p of posts.slice(1); let i = index"
            class="post-card rv"
            [class.d1]="i % 3 === 0"
            [class.d2]="i % 3 === 1"
            [class.d3]="i % 3 === 2"
            [routerLink]="['/blog/posts', p.slug]">
            <div class="card-thumb">
              <svg class="card-thumb-icon" width="32" height="32" viewBox="0 0 120 120" fill="none">
                <circle cx="54" cy="50" r="36" stroke="var(--green)" stroke-width="6"/>
                <ellipse cx="44" cy="40" rx="10" ry="13" fill="var(--green)" transform="rotate(-15 44 40)"/>
                <ellipse cx="62" cy="37" rx="8" ry="10" fill="var(--green)" transform="rotate(10 62 37)"/>
                <ellipse cx="35" cy="56" rx="7" ry="9" fill="var(--green)" transform="rotate(-5 35 56)"/>
                <ellipse cx="64" cy="55" rx="6" ry="7" fill="var(--green)" transform="rotate(5 64 55)"/>
                <path d="M18 50 Q54 64 90 50" stroke="var(--bg)" stroke-width="2.5" fill="none"/>
                <path d="M38 85 Q54 93 70 85" stroke="var(--green)" stroke-width="5.5" fill="none" stroke-linecap="round"/>
                <line x1="54" y1="86" x2="54" y2="103" stroke="var(--green)" stroke-width="5.5" stroke-linecap="round"/>
                <line x1="38" y1="103" x2="70" y2="103" stroke="var(--green)" stroke-width="5.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="tag tag-pale">{{ getTopicName(p.topicSlug) }}</span>
              <h2 class="card-title">{{ p.title }}</h2>
              <p class="card-summary">{{ p.summary }}</p>
              <div class="card-footer">
                <time class="card-date">{{ formatDate(p.publishedAt) }}</time>
                <span class="card-cta">Ler →</span>
              </div>
            </div>
          </a>
        </div>
      </ng-container>

      <div class="load-more-wrap" *ngIf="!loading && hasMore">
        <button class="btn-load-more" (click)="loadMore()" [disabled]="loadingMore">
          <span *ngIf="!loadingMore">Carregar mais</span>
          <span *ngIf="loadingMore" class="pulse-bar"></span>
        </button>
      </div>
    </main>
  `
})
export class PostListComponent implements OnInit, AfterViewInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  topics: Topic[] = [];
  posts: PostSummary[] = [];
  activeTopicSlug: string | null = null;
  loading = true;
  loadingMore = false;
  hasMore = false;
  totalElements = 0;
  private page = 0;
  private readonly pageSize = 12;

  private topicMap = new Map<string, string>();

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.activeTopicSlug = params.get('topicSlug');
      this.loadData();
    });
  }

  ngAfterViewInit(): void {
    this.initRevealObserver();
  }

  setFilter(slug: string | null): void {
    const queryParams = slug ? { topicSlug: slug } : {};
    this.router.navigate([], { queryParams, replaceUrl: true });
  }

  getTopicName(slug: string): string {
    return this.topicMap.get(slug) ?? slug;
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private loadData(): void {
    this.loading = true;
    this.page = 0;
    this.posts = [];
    const params: Record<string, string> = { page: '0', size: String(this.pageSize) };
    if (this.activeTopicSlug) params['topicSlug'] = this.activeTopicSlug;

    const emptyPage: PagedPosts = { content: [], totalElements: 0, totalPages: 0, last: true };

    forkJoin({
      topics: this.api.get<Topic[]>('/topics').pipe(catchError(() => of([] as Topic[]))),
      posts: this.api.get<PagedPosts>('/posts', params).pipe(catchError(() => of(emptyPage)))
    }).subscribe(({ topics, posts }) => {
      this.topics = topics.filter(t => t.active);
      this.topicMap.clear();
      topics.forEach(t => this.topicMap.set(t.slug, t.name));
      this.posts = posts.content;
      this.totalElements = posts.totalElements;
      this.hasMore = !posts.last;
      this.loading = false;
      setTimeout(() => this.revealCards(), 50);
    });
  }

  loadMore(): void {
    if (this.loadingMore || !this.hasMore) return;
    this.loadingMore = true;
    this.page++;
    const params: Record<string, string> = { page: String(this.page), size: String(this.pageSize) };
    if (this.activeTopicSlug) params['topicSlug'] = this.activeTopicSlug;

    this.api.get<PagedPosts>('/posts', params).pipe(catchError(() => of(null))).subscribe(paged => {
      if (paged) {
        this.posts = [...this.posts, ...paged.content];
        this.hasMore = !paged.last;
      }
      this.loadingMore = false;
      setTimeout(() => this.revealCards(), 50);
    });
  }

  private revealCards(): void {
    document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
  }

  private initRevealObserver(): void {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.rv').forEach(el => observer.observe(el));
  }
}
