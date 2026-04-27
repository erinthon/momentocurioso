import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { BlogNavbarComponent } from '../../../shared/blog-navbar/blog-navbar.component';

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
  imports: [CommonModule, RouterLink, BlogNavbarComponent],
  styles: [`
    /* ── Reading progress bar ── */
    .progress-bar {
      position: fixed;
      top: 0; left: 0;
      height: 3px;
      background: var(--green);
      border-radius: 0 3px 3px 0;
      width: 0%;
      z-index: 200;
      transition: width 0.1s linear;
    }

    /* ── Article hero ── */
    .article-hero {
      position: relative;
      border-bottom: 1px solid var(--border);
      padding: 64px 2rem 56px;
      background: var(--bg-1);
      overflow: hidden;
    }
    .article-hero::before {
      content: '';
      position: absolute;
      top: -100px;
      right: -60px;
      width: 420px;
      height: 420px;
      background: radial-gradient(circle, rgba(10,124,56,.10) 0%, transparent 65%);
      pointer-events: none;
    }
    .hero-inner {
      position: relative;
      max-width: 780px;
      margin: 0 auto;
    }
    .hero-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 28px;
    }
    .breadcrumb-back {
      font-family: var(--fu);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: .06em;
      color: var(--text-3);
      text-decoration: none;
      transition: color var(--t);
      &:hover { color: var(--green); }
    }
    .breadcrumb-sep {
      font-family: var(--fu);
      font-size: 11px;
      color: var(--text-4);
    }
    .breadcrumb-topic {
      font-family: var(--fu);
      font-size: 11px;
      font-weight: 600;
      color: var(--green);
    }
    .hero-tag-row {
      margin-bottom: 20px;
    }
    .hero-title {
      font-family: var(--fd);
      font-weight: 800;
      font-size: clamp(30px, 4.5vw, 48px);
      color: var(--text);
      letter-spacing: -1.8px;
      line-height: 1.1;
      margin-bottom: 20px;
    }
    .hero-summary {
      font-family: var(--fb);
      font-size: 18px;
      color: var(--text-3);
      line-height: 1.65;
      max-width: 640px;
      margin-bottom: 28px;
      font-weight: 300;
    }
    .hero-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      flex-wrap: wrap;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .meta-label {
      font-family: var(--fu);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: .14em;
      color: var(--text-4);
      text-transform: uppercase;
    }
    .meta-value {
      font-family: var(--fu);
      font-size: 11px;
      font-weight: 500;
      color: var(--text-3);
    }
    .meta-dot {
      width: 3px; height: 3px;
      border-radius: 50%;
      background: var(--border-2);
    }

    /* ── Article body ── */
    .article-wrapper {
      max-width: 780px;
      margin: 0 auto;
      padding: 64px 2rem 100px;
    }
    .article-content {
      font-family: var(--fb);
      font-size: 17px;
      color: var(--text-2);
      line-height: 1.85;

      ::ng-deep h1, ::ng-deep h2, ::ng-deep h3 {
        font-family: var(--fd);
        font-weight: 800;
        color: var(--text);
        margin: 2.2em 0 0.7em;
        line-height: 1.15;
      }
      ::ng-deep h1 { font-size: 30px; letter-spacing: -1.2px; }
      ::ng-deep h2 { font-size: 24px; letter-spacing: -.7px; }
      ::ng-deep h3 { font-size: 19px; letter-spacing: -.3px; }

      ::ng-deep p { margin: 0 0 1.5em; }

      ::ng-deep strong { color: var(--text); font-weight: 700; }
      ::ng-deep em { color: var(--text-3); font-style: italic; }

      ::ng-deep a {
        color: var(--green);
        text-decoration: none;
        border-bottom: 1px solid rgba(10,124,56,.25);
        transition: border-color var(--t);
        &:hover { border-color: var(--green); }
      }

      ::ng-deep blockquote {
        margin: 2em 0;
        padding: 20px 24px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-left: 3px solid var(--green);
        border-radius: 0 var(--r) var(--r) 0;
        font-style: italic;
        color: var(--text-3);
      }

      ::ng-deep ul, ::ng-deep ol {
        margin: 0 0 1.5em;
        padding-left: 1.6em;
      }
      ::ng-deep li { margin-bottom: 0.6em; }

      ::ng-deep code {
        font-family: monospace;
        font-size: 13px;
        background: var(--bg-2);
        color: var(--text);
        padding: 2px 7px;
        border-radius: 4px;
        border: 1px solid var(--border);
      }

      ::ng-deep pre {
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: var(--r);
        padding: 20px 24px;
        overflow-x: auto;
        margin: 1.8em 0;
        ::ng-deep code { background: none; border: none; padding: 0; }
      }

      ::ng-deep hr {
        border: none;
        border-top: 1px solid var(--border);
        margin: 2.8em 0;
      }
    }

    /* ── Article footer ── */
    .article-footer {
      margin-top: 64px;
      padding-top: 28px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-back {
      font-family: var(--fu);
      font-size: 13px;
      font-weight: 600;
      color: var(--green);
      text-decoration: none;
      transition: opacity var(--t);
      &:hover { opacity: .75; }
    }
    .footer-label {
      font-family: var(--fu);
      font-size: 10px;
      font-weight: 500;
      color: var(--text-4);
      letter-spacing: .12em;
      text-transform: uppercase;
    }

    /* ── States ── */
    .state-loading, .state-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 120px 2rem;
      text-align: center;
    }
    .state-loading p {
      font-family: var(--fu);
      font-size: 13px;
      color: var(--text-4);
      letter-spacing: .08em;
    }
    .error-code {
      font-family: var(--fd);
      font-weight: 800;
      font-size: 80px;
      color: var(--green);
      letter-spacing: -4px;
      line-height: 1;
    }
    .error-msg {
      font-family: var(--fb);
      font-size: 18px;
      color: var(--text-3);
    }
    .error-back {
      font-family: var(--fu);
      font-size: 13px;
      font-weight: 600;
      color: var(--green);
      text-decoration: none;
      margin-top: 4px;
      &:hover { opacity: .75; }
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

    /* ── Reveal ── */
    .rv { opacity: 0; transform: translateY(22px); transition: opacity var(--ts), transform var(--ts); }
    .rv.in { opacity: 1; transform: none; }

    @media (max-width: 600px) {
      .article-hero { padding: 48px 1rem 40px; }
      .article-wrapper { padding: 40px 1rem 72px; }
      .hero-meta { gap: 12px; }
    }
  `],
  template: `
    <div class="progress-bar" [style.width.%]="readingProgress"></div>

    <app-blog-navbar />

    <div *ngIf="loading" class="state-loading">
      <span class="pulse-bar"></span>
      <p>Carregando artigo...</p>
    </div>

    <div *ngIf="!loading && !post" class="state-error">
      <span class="error-code">404</span>
      <p class="error-msg">Post não encontrado</p>
      <a class="error-back" routerLink="/blog/posts">← Voltar para o blog</a>
    </div>

    <ng-container *ngIf="!loading && post">
      <header class="article-hero">
        <div class="hero-inner rv">
          <div class="hero-breadcrumb">
            <a class="breadcrumb-back" routerLink="/blog/posts">← Blog</a>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-topic">{{ getTopicName(post.topicSlug) }}</span>
          </div>
          <div class="hero-tag-row">
            <span class="tag tag-pale">{{ getTopicName(post.topicSlug) }}</span>
          </div>
          <h1 class="hero-title">{{ post.title }}</h1>
          <p class="hero-summary">{{ post.summary }}</p>
          <div class="hero-meta">
            <div class="meta-item">
              <span class="meta-label">Publicado em</span>
              <time class="meta-value">{{ formatDate(post.publishedAt) }}</time>
            </div>
            <span class="meta-dot"></span>
            <div class="meta-item">
              <span class="meta-label">Leitura</span>
              <span class="meta-value">{{ readingTime }} min</span>
            </div>
          </div>
        </div>
      </header>

      <div class="article-wrapper">
        <article class="article-content rv" [innerHTML]="postContent"></article>

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

  post: PostDetail | null = null;
  postContent = '';
  loading = true;
  readingProgress = 0;
  readingTime = 0;

  private topicNames: Record<string, string> = {
    ciencia: 'Ciência', tecnologia: 'Tecnologia', natureza: 'Natureza',
    historia: 'História', espaco: 'Espaço', gadgets: 'Gadgets',
    arte: 'Arte', enigmas: 'Enigmas', cultura: 'Cultura'
  };

  private scrollHandler = () => this.updateProgress();

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.api.get<PostDetail>(`/posts/${slug}`).subscribe({
      next: (post) => {
        this.post = post;
        this.postContent = post.content;
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

  getTopicName(slug: string): string {
    return this.topicNames[slug] ?? slug;
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
