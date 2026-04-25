import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../../core/services/api.service';

interface PostDetail {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  topicSlug: string;
  publishedAt: string;
}

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .progress-bar {
      position: fixed;
      top: 0; left: 0;
      height: 2px;
      background: var(--gold);
      width: 0%;
      z-index: 200;
      transition: width 0.1s linear;
    }

    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(11,11,18,.88);
      backdrop-filter: blur(18px);
      border-bottom: 1px solid var(--border);
      padding: 0 2rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
    }
    .wordmark {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }
    .wordmark-momento {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: 9px;
      letter-spacing: 0.18em;
      color: var(--bright);
      text-transform: uppercase;
    }
    .wordmark-curioso {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 18px;
      color: var(--gold);
      letter-spacing: -0.5px;
      line-height: 1.1;
    }
    .wordmark-tagline {
      font-family: var(--font-mono);
      font-size: 7px;
      color: var(--mid);
      letter-spacing: 0.14em;
      margin-top: 1px;
    }
    .nav-link {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.06em;
      color: var(--mid);
      transition: color var(--transition-fast);
      text-transform: uppercase;
      text-decoration: none;
      &:hover { color: var(--gold); }
    }

    .article-hero {
      position: relative;
      border-bottom: 1px solid var(--border);
      padding: 64px 2rem 56px;
      overflow: hidden;
    }
    .hero-noise {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: .022;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      background-size: 256px 256px;
    }
    .hero-inner {
      position: relative;
      max-width: 780px;
      margin: 0 auto;
    }
    .hero-breadcrumb {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
    }
    .breadcrumb-back {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      color: var(--mid);
      text-decoration: none;
      text-transform: uppercase;
      transition: color var(--transition-fast);
      &:hover { color: var(--gold); }
    }
    .breadcrumb-sep {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
    }
    .hero-sep {
      width: 34px;
      height: 2px;
      background: var(--gold);
      display: block;
      margin-bottom: 24px;
    }
    .hero-tag-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .hero-title {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: clamp(32px, 5vw, 52px);
      color: var(--bright);
      letter-spacing: -2px;
      line-height: 1.08;
      margin-bottom: 24px;
    }
    .hero-summary {
      font-family: var(--font-body);
      font-size: 18px;
      color: var(--mid);
      line-height: 1.65;
      max-width: 640px;
      margin-bottom: 28px;
      font-weight: 300;
    }
    .hero-meta {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .meta-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.16em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .meta-value {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      color: var(--mid);
    }
    .meta-dot {
      width: 3px; height: 3px;
      border-radius: 50%;
      background: var(--dim);
    }

    .article-wrapper {
      max-width: 780px;
      margin: 0 auto;
      padding: 64px 2rem 100px;
    }
    .article-content {
      font-family: var(--font-body);
      font-size: 17px;
      color: var(--bright);
      line-height: 1.8;
      border-left: 3px solid var(--gold);
      padding-left: 28px;

      ::ng-deep h1, ::ng-deep h2, ::ng-deep h3 {
        font-family: var(--font-display);
        font-weight: 800;
        color: var(--bright);
        margin: 2em 0 0.6em;
        line-height: 1.15;
      }
      ::ng-deep h1 { font-size: 32px; letter-spacing: -1.5px; }
      ::ng-deep h2 { font-size: 26px; letter-spacing: -0.5px; }
      ::ng-deep h3 { font-size: 20px; letter-spacing: -0.3px; }

      ::ng-deep p { margin: 0 0 1.4em; }

      ::ng-deep strong { color: var(--bright); font-weight: 500; }
      ::ng-deep em { color: var(--mid); }

      ::ng-deep a {
        color: var(--gold);
        text-decoration: none;
        border-bottom: 1px solid rgba(245,197,24,.3);
        transition: border-color var(--transition-fast);
        &:hover { border-color: var(--gold); }
      }

      ::ng-deep blockquote {
        margin: 2em 0;
        padding: 20px 24px;
        background: var(--ink-1);
        border-left: 3px solid var(--gold);
        font-style: italic;
        color: var(--mid);
      }

      ::ng-deep ul, ::ng-deep ol {
        margin: 0 0 1.4em;
        padding-left: 1.5em;
      }
      ::ng-deep li { margin-bottom: 0.5em; }

      ::ng-deep code {
        font-family: var(--font-mono);
        font-size: 13px;
        background: var(--ink-2);
        color: var(--gold);
        padding: 2px 6px;
        border-radius: 2px;
      }

      ::ng-deep pre {
        background: var(--ink-1);
        border: 1px solid var(--border);
        padding: 20px;
        overflow-x: auto;
        margin: 1.6em 0;
        ::ng-deep code { background: none; padding: 0; }
      }

      ::ng-deep hr {
        border: none;
        border-top: 1px solid var(--border);
        margin: 2.5em 0;
      }
    }

    .article-footer {
      margin-top: 64px;
      padding-top: 32px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-back {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      color: var(--gold);
      text-decoration: none;
      text-transform: uppercase;
      transition: opacity var(--transition-fast);
      &:hover { opacity: .75; }
    }
    .footer-label {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .state-loading, .state-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 120px 2rem;
      text-align: center;
    }
    .state-loading p, .state-error p {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--dim);
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .state-error .error-code {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 72px;
      color: var(--gold);
      letter-spacing: -3px;
      line-height: 1;
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
    .back-link {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--gold);
      letter-spacing: 0.08em;
      text-decoration: none;
      margin-top: 8px;
      &:hover { opacity: .75; }
    }

    .rv { opacity: 0; transform: translateY(28px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
    .rv.in { opacity: 1; transform: none; }

    @media (max-width: 600px) {
      .navbar { padding: 0 1rem; }
      .article-hero { padding: 48px 1rem 40px; }
      .article-wrapper { padding: 48px 1rem 80px; }
    }
  `],
  template: `
    <div class="progress-bar" [style.width.%]="readingProgress"></div>

    <nav class="navbar">
      <a class="logo" routerLink="/blog/posts">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="15" cy="15" r="10" stroke="#f5c518" stroke-width="2.2"/>
          <line x1="22.5" y1="22.5" x2="32" y2="32" stroke="#f5c518" stroke-width="2.2" stroke-linecap="round"/>
          <text x="11.5" y="20" font-family="Syne" font-weight="800" font-size="12" fill="#f5c518">?</text>
        </svg>
        <div class="wordmark">
          <span class="wordmark-momento">Momento</span>
          <span class="wordmark-curioso">CURIOSO</span>
          <span class="wordmark-tagline">Mate a sua curiosidade</span>
        </div>
      </a>
      <a class="nav-link" routerLink="/admin/topics">Admin</a>
    </nav>

    <div *ngIf="loading" class="state-loading">
      <span class="pulse"></span>
      <p>Carregando artigo...</p>
    </div>

    <div *ngIf="!loading && !post" class="state-error">
      <span class="error-code">404</span>
      <p>Post não encontrado</p>
      <a class="back-link" routerLink="/blog/posts">← Voltar para o blog</a>
    </div>

    <ng-container *ngIf="!loading && post">
      <header class="article-hero">
        <div class="hero-noise"></div>
        <div class="hero-inner rv">
          <div class="hero-breadcrumb">
            <a class="breadcrumb-back" routerLink="/blog/posts">← Blog</a>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-back" style="color:var(--gold)">{{ post.topicSlug }}</span>
          </div>
          <span class="hero-sep"></span>
          <div class="hero-tag-row">
            <span class="tag-gold">{{ post.topicSlug }}</span>
          </div>
          <h1 class="hero-title">{{ post.title }}</h1>
          <p class="hero-summary">{{ post.summary }}</p>
          <div class="hero-meta">
            <span class="meta-label">Publicado em</span>
            <time class="meta-value">{{ formatDate(post.publishedAt) }}</time>
            <span class="meta-dot"></span>
            <span class="meta-label">Leitura</span>
            <span class="meta-value">{{ readingTime }} min</span>
          </div>
        </div>
      </header>

      <div class="article-wrapper">
        <article class="article-content rv" [innerHTML]="safeContent"></article>

        <footer class="article-footer rv">
          <a class="footer-back" routerLink="/blog/posts">← Voltar ao blog</a>
          <span class="footer-label">Momento Curioso · IA Editorial</span>
        </footer>
      </div>
    </ng-container>
  `
})
export class PostDetailComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  post: PostDetail | null = null;
  safeContent: SafeHtml = '';
  loading = true;
  readingProgress = 0;
  readingTime = 0;

  private scrollHandler = () => this.updateProgress();

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.api.get<PostDetail>(`/posts/${slug}`).subscribe({
      next: (post) => {
        this.post = post;
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(post.content);
        this.readingTime = this.calcReadingTime(post.content);
        this.loading = false;
        setTimeout(() => this.revealElements(), 80);
      },
      error: () => {
        this.loading = false;
      }
    });
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  private updateProgress(): void {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop || document.body.scrollTop;
    const total = doc.scrollHeight - doc.clientHeight;
    this.readingProgress = total > 0 ? Math.round((scrolled / total) * 100) : 0;
  }

  private calcReadingTime(html: string): number {
    const text = html.replace(/<[^>]+>/g, ' ');
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }

  private revealElements(): void {
    document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
  }
}
