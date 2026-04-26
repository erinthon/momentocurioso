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
      padding: 32px 2rem 24px;
      background: var(--bg-1);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px;
    }
    .header-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .eyebrow-line { width: 24px; height: 2px; background: var(--green); flex-shrink: 0; }
    .eyebrow-text {
      font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .18em; text-transform: uppercase; color: var(--text-3);
    }
    .admin-title {
      font-family: var(--fd); font-weight: 800; font-size: 32px;
      color: var(--text); letter-spacing: -1.2px;
    }

    .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .tab-btn {
      font-family: var(--fu); font-size: 12px; font-weight: 600; letter-spacing: .04em;
      color: var(--text-3); background: var(--bg-1); border: 1px solid var(--border);
      border-radius: 40px; padding: 7px 16px; cursor: pointer; transition: all var(--t);
      white-space: nowrap;
      &:hover { background: var(--green-pale); color: var(--green); border-color: var(--green); }
      &.active { background: var(--green); color: #fff; border-color: var(--green); }
    }
    .tab-count {
      font-family: var(--fu); font-size: 10px; font-weight: 500;
      opacity: .7; margin-left: 4px;
    }

    .content { padding: 28px 2rem 80px; max-width: 1200px; margin: 0 auto; }

    .results-bar {
      display: flex; align-items: center; gap: 14px; margin-bottom: 20px;
    }
    .results-label {
      font-family: var(--fu); font-size: 11px; font-weight: 600;
      color: var(--text-3); letter-spacing: .1em; text-transform: uppercase;
    }

    .table-wrapper {
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); overflow: hidden;
    }
    .posts-table { width: 100%; border-collapse: collapse; }
    .posts-table th {
      font-family: var(--fu); font-size: 10px; font-weight: 600; letter-spacing: .14em;
      color: var(--text-4); text-transform: uppercase; text-align: left;
      padding: 12px 16px; border-bottom: 1px solid var(--border);
      background: var(--bg-1);
    }
    .posts-table td {
      padding: 16px; border-bottom: 1px solid var(--border); vertical-align: top;
    }
    .posts-table tr:last-child td { border-bottom: none; }
    .posts-table tr:hover td { background: var(--bg-2); }

    .col-title { width: 35%; }
    .col-topic { width: 12%; }
    .col-status { width: 12%; }
    .col-date { width: 14%; }
    .col-actions { width: 27%; text-align: right; }

    .post-title {
      font-family: var(--fd); font-weight: 700; font-size: 14px;
      color: var(--text); letter-spacing: -.3px; line-height: 1.3; margin-bottom: 3px;
    }
    .post-slug {
      font-family: var(--fu); font-size: 10px; color: var(--text-4); letter-spacing: .06em;
    }
    .post-summary {
      font-family: var(--fb); font-size: 12px; color: var(--text-3);
      line-height: 1.5; margin-top: 5px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .topic-label {
      font-family: var(--fu); font-size: 11px; font-weight: 600;
      color: var(--text-3); letter-spacing: .06em;
    }
    .date-val {
      font-family: var(--fu); font-size: 11px; color: var(--text-4); letter-spacing: .06em;
    }

    .actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
    .btn-action {
      font-family: var(--fu); font-size: 11px; font-weight: 600; letter-spacing: .04em;
      border-radius: var(--r); padding: 6px 13px; cursor: pointer;
      border: 1.5px solid; transition: all var(--t); white-space: nowrap; text-decoration: none;
      display: inline-flex; align-items: center;
    }
    .btn-approve {
      color: var(--green); border-color: var(--green); background: transparent;
      &:hover { background: var(--green); color: #fff; }
    }
    .btn-reject {
      color: var(--coral); border-color: rgba(220,38,38,.4); background: transparent;
      &:hover { background: var(--coral); color: #fff; border-color: var(--coral); }
    }
    .btn-view {
      color: var(--text-3); border-color: var(--border); background: transparent;
      &:hover { color: var(--green); border-color: var(--green); }
    }
    .btn-action:disabled { opacity: .35; cursor: not-allowed; }

    .state-loading, .state-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; padding: 80px 0; text-align: center;
    }
    .state-loading p, .state-empty p {
      font-family: var(--fu); font-size: 12px; color: var(--text-4);
      letter-spacing: .1em; text-transform: uppercase;
    }
    .pulse-bar { width: 32px; height: 3px; background: var(--green); border-radius: 2px; animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{width:32px;opacity:1} 50%{width:56px;opacity:.4} }

    @media (max-width: 900px) {
      .admin-header { flex-direction: column; align-items: flex-start; }
      .content { padding: 20px 1rem 60px; }
    }
  `],
  template: `
    <app-admin-navbar />

    <div class="admin-header">
      <div>
        <div class="header-eyebrow">
          <span class="eyebrow-line"></span>
          <span class="eyebrow-text">Admin · Moderação</span>
        </div>
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
        <span class="pulse-bar"></span>
        <p>Carregando posts...</p>
      </div>

      <ng-container *ngIf="!loading">
        <div class="results-bar">
          <span class="sep-short"></span>
          <span class="results-label">{{ filtered.length }} {{ filtered.length === 1 ? 'post' : 'posts' }}</span>
        </div>

        <div *ngIf="filtered.length === 0" class="state-empty">
          <span class="sep-short"></span>
          <p>Nenhum post {{ filterLabel }}</p>
        </div>

        <div class="table-wrapper" *ngIf="filtered.length > 0">
          <table class="posts-table">
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
                  <span class="topic-label">{{ p.topicSlug }}</span>
                </td>
                <td>
                  <span class="tag"
                    [class.tag-ghost]="p.status === 'DRAFT'"
                    [class.tag-green]="p.status === 'PUBLISHED'"
                    [class.tag-breaking]="p.status === 'REJECTED'">
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
        </div>
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
