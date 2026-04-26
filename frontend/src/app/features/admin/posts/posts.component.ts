import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';

type PostStatus = 'DRAFT' | 'PUBLISHED' | 'REJECTED';

interface AdminPost {
  id: number;
  title: string;
  slug: string;
  summary: string;
  topicSlug: string;
  status: PostStatus;
  createdAt: string;
  publishedAt: string | null;
}

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminNavbarComponent],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--bg); }

    .admin-header {
      padding: 40px 2rem 32px; border-bottom: 1px solid var(--border);
      display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px;
    }
    .header-left {}
    .admin-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: .2em; color: var(--gold); text-transform: uppercase; margin-bottom: 8px; }
    .admin-title { font-family: var(--font-display); font-weight: 800; font-size: 36px; color: var(--bright); letter-spacing: -1.5px; }

    .filter-tabs {
      display: flex; gap: 0; border: 1px solid var(--border);
    }
    .tab-btn {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .1em;
      text-transform: uppercase; background: none; color: var(--dim);
      border: none; border-right: 1px solid var(--border);
      padding: 8px 16px; cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast);
      &:last-child { border-right: none; }
      &:hover { color: var(--bright); background: var(--ink-2); }
      &.active { color: var(--gold); background: rgba(245,197,24,.08); }
    }
    .tab-count {
      font-family: var(--font-mono); font-size: 9px; color: var(--dim);
      background: var(--ink-2); padding: 1px 5px; border-radius: 2px;
      margin-left: 4px;
    }
    .tab-btn.active .tab-count { color: var(--gold); background: rgba(245,197,24,.12); }

    .content { padding: 32px 2rem 80px; max-width: 1200px; margin: 0 auto; }

    .results-bar {
      display: flex; align-items: center; gap: 16px; margin-bottom: 24px;
    }
    .sep-gold { width: 34px; height: 2px; background: var(--gold); display: block; flex-shrink: 0; }
    .results-label { font-family: var(--font-mono); font-size: 10px; color: var(--mid); letter-spacing: .12em; text-transform: uppercase; }

    .posts-table { width: 100%; border-collapse: collapse; }
    .posts-table th {
      font-family: var(--font-mono); font-size: 9px; letter-spacing: .16em;
      color: var(--dim); text-transform: uppercase; text-align: left;
      padding: 10px 16px; border-bottom: 1px solid var(--border);
      background: var(--ink-1); font-weight: 400;
    }
    .posts-table td {
      padding: 16px; border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    .posts-table tr:hover td { background: var(--ink-1); }

    .col-title { width: 35%; }
    .col-topic { width: 12%; }
    .col-status { width: 12%; }
    .col-date { width: 14%; }
    .col-actions { width: 27%; text-align: right; }

    .post-title {
      font-family: var(--font-display); font-weight: 800; font-size: 14px;
      color: var(--bright); letter-spacing: -.3px; line-height: 1.3; margin-bottom: 4px;
    }
    .post-slug {
      font-family: var(--font-mono); font-size: 10px; color: var(--dim);
      letter-spacing: .06em;
    }
    .post-summary {
      font-family: var(--font-body); font-size: 12px; color: var(--mid);
      line-height: 1.5; margin-top: 6px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .topic-badge {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .08em;
      color: var(--mid); text-transform: uppercase;
    }
    .status-badge {
      font-family: var(--font-mono); font-size: 9px; letter-spacing: .1em;
      text-transform: uppercase; padding: 3px 8px; border-radius: var(--radius-tag);
      white-space: nowrap; display: inline-block;
    }
    .status-draft { background: rgba(124,124,142,.15); color: var(--mid); border: 1px solid var(--border); }
    .status-published { background: rgba(245,197,24,.12); color: var(--gold); border: 1px solid rgba(245,197,24,.3); }
    .status-rejected { background: rgba(255,77,46,.1); color: var(--coral); border: 1px solid rgba(255,77,46,.25); }
    .date-val { font-family: var(--font-mono); font-size: 10px; color: var(--dim); letter-spacing: .1em; }

    .actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
    .btn-action {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .08em;
      text-transform: uppercase; background: none; border: 1px solid;
      padding: 5px 12px; cursor: pointer; border-radius: var(--radius-tag);
      transition: background var(--transition-fast), color var(--transition-fast);
      white-space: nowrap;
    }
    .btn-approve { color: var(--gold); border-color: rgba(245,197,24,.4); &:hover { background: var(--gold); color: var(--ink); } }
    .btn-reject { color: var(--coral); border-color: rgba(255,77,46,.3); &:hover { background: var(--coral); color: #fff; } }
    .btn-view { color: var(--mid); border-color: var(--border); &:hover { color: var(--bright); border-color: var(--mid); } }
    .btn-action:disabled { opacity: .35; cursor: not-allowed; }

    .state-loading, .state-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; padding: 80px 0; text-align: center;
    }
    .state-loading p, .state-empty p {
      font-family: var(--font-mono); font-size: 11px; color: var(--dim);
      letter-spacing: .12em; text-transform: uppercase;
    }
    .pulse { display: block; width: 34px; height: 2px; background: var(--gold); animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{opacity:1;width:34px}50%{opacity:.3;width:60px} }

    @media (max-width: 900px) {
      .admin-header { flex-direction: column; align-items: flex-start; }
      .col-summary, .col-actions th { display: none; }
      .posts-table td:last-child { display: none; }
      .content { padding: 24px 1rem 60px; }
    }
  `],
  template: `
    <app-admin-navbar />

    <div class="admin-header">
      <div class="header-left">
        <p class="admin-label">Admin · Moderação</p>
        <h1 class="admin-title">Posts</h1>
      </div>
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="activeFilter === 'ALL'" (click)="setFilter('ALL')">
          Todos <span class="tab-count">{{ posts.length }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'DRAFT'" (click)="setFilter('DRAFT')">
          Draft <span class="tab-count">{{ countByStatus('DRAFT') }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'PUBLISHED'" (click)="setFilter('PUBLISHED')">
          Publicados <span class="tab-count">{{ countByStatus('PUBLISHED') }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'REJECTED'" (click)="setFilter('REJECTED')">
          Rejeitados <span class="tab-count">{{ countByStatus('REJECTED') }}</span>
        </button>
      </div>
    </div>

    <div class="content">
      <div *ngIf="loading" class="state-loading">
        <span class="pulse"></span>
        <p>Carregando posts...</p>
      </div>

      <ng-container *ngIf="!loading">
        <div class="results-bar">
          <span class="sep-gold"></span>
          <span class="results-label">{{ filtered.length }} {{ filtered.length === 1 ? 'post' : 'posts' }}</span>
        </div>

        <div *ngIf="filtered.length === 0" class="state-empty">
          <span class="sep-gold"></span>
          <p>Nenhum post {{ filterLabel }}</p>
        </div>

        <table class="posts-table" *ngIf="filtered.length > 0">
          <thead>
            <tr>
              <th class="col-title">Título</th>
              <th class="col-topic">Tópico</th>
              <th class="col-status">Status</th>
              <th class="col-date">Criado em</th>
              <th class="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filtered">
              <td>
                <div class="post-title">{{ p.title }}</div>
                <div class="post-slug">/{{ p.slug }}</div>
                <div class="post-summary">{{ p.summary }}</div>
              </td>
              <td>
                <span class="topic-badge">{{ p.topicSlug }}</span>
              </td>
              <td>
                <span class="status-badge"
                  [class.status-draft]="p.status === 'DRAFT'"
                  [class.status-published]="p.status === 'PUBLISHED'"
                  [class.status-rejected]="p.status === 'REJECTED'">
                  {{ statusLabel(p.status) }}
                </span>
              </td>
              <td>
                <span class="date-val">{{ formatDate(p.createdAt) }}</span>
              </td>
              <td>
                <div class="actions">
                  <button
                    class="btn-action btn-approve"
                    *ngIf="p.status !== 'PUBLISHED'"
                    (click)="approve(p)"
                    [disabled]="pendingId === p.id">
                    {{ pendingId === p.id ? '...' : '✓ Publicar' }}
                  </button>
                  <button
                    class="btn-action btn-reject"
                    *ngIf="p.status !== 'REJECTED'"
                    (click)="reject(p)"
                    [disabled]="pendingId === p.id">
                    {{ pendingId === p.id ? '...' : '✕ Rejeitar' }}
                  </button>
                  <a
                    class="btn-action btn-view"
                    *ngIf="p.status === 'PUBLISHED'"
                    [routerLink]="['/blog/posts', p.slug]"
                    target="_blank">
                    Ver →
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </ng-container>
    </div>
  `
})
export class AdminPostsComponent implements OnInit {
  private api = inject(ApiService);

  posts: AdminPost[] = [];
  filtered: AdminPost[] = [];
  activeFilter: 'ALL' | PostStatus = 'ALL';
  loading = true;
  pendingId: number | null = null;

  get filterLabel(): string {
    const map: Record<string, string> = { ALL: '', DRAFT: 'em rascunho', PUBLISHED: 'publicado', REJECTED: 'rejeitado' };
    return map[this.activeFilter] ?? '';
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  setFilter(f: 'ALL' | PostStatus): void {
    this.activeFilter = f;
    this.applyFilter();
  }

  countByStatus(status: PostStatus): number {
    return this.posts.filter(p => p.status === status).length;
  }

  statusLabel(s: PostStatus): string {
    return { DRAFT: 'Draft', PUBLISHED: 'Publicado', REJECTED: 'Rejeitado' }[s];
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
  }

  approve(post: AdminPost): void {
    this.pendingId = post.id;
    this.api.patch<{ status: PostStatus }>(`/admin/posts/${post.id}/approve`, {}).subscribe({
      next: () => {
        post.status = 'PUBLISHED';
        post.publishedAt = new Date().toISOString();
        this.pendingId = null;
        this.applyFilter();
      },
      error: () => { this.pendingId = null; }
    });
  }

  reject(post: AdminPost): void {
    this.pendingId = post.id;
    this.api.patch<{ status: PostStatus }>(`/admin/posts/${post.id}/reject`, {}).subscribe({
      next: () => {
        post.status = 'REJECTED';
        this.pendingId = null;
        this.applyFilter();
      },
      error: () => { this.pendingId = null; }
    });
  }

  private loadPosts(): void {
    this.api.get<AdminPost[]>('/admin/posts').subscribe({
      next: (posts) => {
        this.posts = posts;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private applyFilter(): void {
    this.filtered = this.activeFilter === 'ALL'
      ? this.posts
      : this.posts.filter(p => p.status === this.activeFilter);
  }
}
