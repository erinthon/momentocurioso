import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
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
    .hero {
      position: relative;
      padding: 72px 2rem 56px;
      overflow: hidden;
      border-bottom: 1px solid var(--border);
    }
    .hero-noise {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: .022;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      background-size: 256px 256px;
    }
    .hero-deco {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 4rem;
      pointer-events: none;
      overflow: hidden;
    }
    .hero-deco-text {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 320px;
      color: var(--bright);
      opacity: 0.025;
      line-height: 1;
      user-select: none;
    }
    .hero-inner {
      position: relative;
      max-width: 680px;
    }
    .hero-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      color: var(--gold);
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .hero-sep {
      width: 34px;
      height: 2px;
      background: var(--gold);
      display: block;
      margin-bottom: 20px;
    }
    .hero-title {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: clamp(36px, 5vw, 56px);
      color: var(--bright);
      letter-spacing: -2px;
      line-height: 1.05;
      margin-bottom: 20px;
    }
    .hero-title span { color: var(--gold); }
    .hero-sub {
      font-family: var(--font-body);
      font-size: 16px;
      color: var(--mid);
      line-height: 1.6;
      max-width: 480px;
    }

    .filter-bar {
      border-bottom: 1px solid var(--border);
      background: var(--ink);
      padding: 0 2rem;
      overflow-x: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .filter-inner {
      display: flex;
      gap: 0;
      min-width: max-content;
    }
    .topic-btn {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--mid);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 16px 20px;
      cursor: pointer;
      transition: color var(--transition-fast), border-color var(--transition-fast);
      white-space: nowrap;
      &:hover { color: var(--bright); }
      &.active { color: var(--gold); border-bottom-color: var(--gold); }
    }

    .posts-section {
      padding: 48px 2rem 80px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 36px;
    }
    .section-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      color: var(--mid);
      text-transform: uppercase;
    }
    .section-count {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.12em;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
    }
    @media (max-width: 960px) {
      .posts-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .posts-grid { grid-template-columns: 1fr; }
      .navbar { padding: 0 1rem; }
      .hero { padding: 48px 1rem 40px; }
      .filter-bar { padding: 0 1rem; }
      .posts-section { padding: 32px 1rem 60px; }
    }

    .post-card {
      display: block;
      background: var(--ink-1);
      padding: 28px;
      cursor: pointer;
      transition: background var(--transition-base), border-color var(--transition-base), transform var(--transition-base);
      border: 1px solid transparent;
      margin: -1px;
      &:hover {
        background: var(--ink-2);
        border-color: var(--gold);
        transform: translateY(-3px);
        z-index: 1;
      }
    }
    .card-tag-row {
      margin-bottom: 14px;
    }
    .card-title {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 20px;
      color: var(--bright);
      letter-spacing: -0.5px;
      line-height: 1.25;
      margin-bottom: 12px;
    }
    .card-summary {
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--mid);
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-date {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.12em;
    }
    .card-cta {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--gold);
      letter-spacing: 0.08em;
      opacity: 0;
      transition: opacity var(--transition-fast);
    }
    .post-card:hover .card-cta { opacity: 1; }

    .state-empty, .state-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 80px 0;
      text-align: center;
    }
    .state-empty p, .state-loading p {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--dim);
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .pulse {
      display: block;
      width: 34px;
      height: 2px;
      background: var(--gold);
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; width: 34px; }
      50% { opacity: .3; width: 60px; }
    }
  `],
  template: `
    <app-blog-navbar />

    <header class="hero">
      <div class="hero-noise"></div>
      <div class="hero-deco"><span class="hero-deco-text">?</span></div>
      <div class="hero-inner">
        <p class="hero-label">Blog · IA Editorial</p>
        <span class="hero-sep"></span>
        <h1 class="hero-title">
          Satisfaça sua<br/><span>curiosidade</span>
        </h1>
        <p class="hero-sub">Conteúdo gerado por inteligência artificial sobre o que há de mais fascinante no mundo.</p>
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
        <span class="sep-line-short"></span>
        <span class="section-label">{{ activeTopicSlug ? getTopicName(activeTopicSlug) : 'Todos os posts' }}</span>
        <span class="section-count" *ngIf="!loading">{{ posts.length }} {{ posts.length === 1 ? 'post' : 'posts' }}</span>
      </div>

      <div *ngIf="loading" class="state-loading">
        <span class="pulse"></span>
        <p>Carregando posts...</p>
      </div>

      <div *ngIf="!loading && posts.length === 0" class="state-empty">
        <span class="sep-line-short"></span>
        <p>Nenhum post publicado ainda</p>
      </div>

      <div *ngIf="!loading && posts.length > 0" class="posts-grid">
        <a
          *ngFor="let p of posts"
          class="post-card rv"
          [routerLink]="['/blog/posts', p.slug]">
          <div class="card-tag-row">
            <span class="tag-gold">{{ getTopicName(p.topicSlug) }}</span>
          </div>
          <h2 class="card-title">{{ p.title }}</h2>
          <p class="card-summary">{{ p.summary }}</p>
          <div class="card-footer">
            <time class="card-date">{{ formatDate(p.publishedAt) }}</time>
            <span class="card-cta">Ler →</span>
          </div>
        </a>
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
    const params: Record<string, string> = {};
    if (this.activeTopicSlug) params['topicSlug'] = this.activeTopicSlug;

    forkJoin({
      topics: this.api.get<Topic[]>('/topics'),
      posts: this.api.get<PostSummary[]>('/posts', params)
    }).subscribe({
      next: ({ topics, posts }) => {
        this.topics = topics.filter(t => t.active);
        this.topicMap.clear();
        topics.forEach(t => this.topicMap.set(t.slug, t.name));
        this.posts = posts;
        this.loading = false;
        setTimeout(() => this.revealCards(), 50);
      },
      error: () => {
        this.loading = false;
      }
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
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.rv').forEach(el => observer.observe(el));
  }
}
