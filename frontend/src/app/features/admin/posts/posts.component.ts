import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

interface AdminPostDetail extends AdminPost {
  content: string;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminNavbarComponent],
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
    .tab-count { font-family: var(--fu); font-size: 10px; font-weight: 500; opacity: .7; margin-left: 4px; }

    .content { padding: 28px 2rem 80px; max-width: 1200px; margin: 0 auto; }

    .results-bar { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
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
      padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--bg-1);
    }
    .posts-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .posts-table tr:last-child td { border-bottom: none; }
    .posts-table tr:hover td { background: var(--bg-2); }

    .col-title { width: 38%; }
    .col-topic { width: 10%; }
    .col-status { width: 10%; }
    .col-date { width: 12%; }
    .col-actions { width: 30%; text-align: right; }

    .post-title {
      font-family: var(--fd); font-weight: 700; font-size: 13px;
      color: var(--text); letter-spacing: -.3px; line-height: 1.3; margin-bottom: 2px;
    }
    .post-slug { font-family: var(--fu); font-size: 10px; color: var(--text-4); letter-spacing: .06em; }
    .topic-label { font-family: var(--fu); font-size: 11px; font-weight: 600; color: var(--text-3); letter-spacing: .06em; }
    .date-val { font-family: var(--fu); font-size: 11px; color: var(--text-4); letter-spacing: .06em; }

    .actions { display: flex; align-items: center; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
    .btn-action {
      font-family: var(--fu); font-size: 11px; font-weight: 600; letter-spacing: .04em;
      border-radius: var(--r); padding: 5px 11px; cursor: pointer;
      border: 1.5px solid; transition: all var(--t); white-space: nowrap;
      text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
    }
    .btn-view {
      color: var(--text-3); border-color: var(--border); background: transparent;
      &:hover { color: var(--green); border-color: var(--green); background: var(--green-pale); }
    }
    .btn-edit {
      color: var(--text-2); border-color: var(--border); background: transparent;
      &:hover { color: var(--text); border-color: var(--text-3); background: var(--bg-2); }
    }
    .btn-approve {
      color: var(--green); border-color: var(--green); background: transparent;
      &:hover { background: var(--green); color: #fff; }
    }
    .btn-unpublish {
      color: #b45309; border-color: rgba(180,83,9,.4); background: transparent;
      &:hover { background: #b45309; color: #fff; border-color: #b45309; }
    }
    .btn-reject {
      color: var(--coral); border-color: rgba(220,38,38,.4); background: transparent;
      &:hover { background: var(--coral); color: #fff; border-color: var(--coral); }
    }
    .btn-delete {
      color: var(--coral); border-color: transparent; background: transparent;
      padding: 5px 8px;
      &:hover { background: rgba(220,38,38,.1); border-color: rgba(220,38,38,.3); }
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

    .load-more-wrapper { display: flex; justify-content: center; margin-top: 28px; }
    .btn-load-more {
      font-family: var(--fu); font-size: 12px; font-weight: 600; letter-spacing: .06em;
      color: var(--green); background: transparent; border: 1.5px solid var(--green);
      border-radius: 40px; padding: 9px 28px; cursor: pointer; transition: all var(--t);
      &:hover { background: var(--green); color: #fff; }
      &:disabled { opacity: .35; cursor: not-allowed; }
    }

    /* ── Backdrop ── */
    .backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      backdrop-filter: blur(2px); z-index: 100;
      display: flex; align-items: center; justify-content: center;
    }

    /* ── Preview drawer ── */
    .preview-drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: min(680px, 95vw);
      background: var(--bg-1); border-left: 1px solid var(--border);
      z-index: 101; display: flex; flex-direction: column;
      box-shadow: -8px 0 32px rgba(0,0,0,.2);
      animation: slideIn .2s ease;
    }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

    .drawer-header {
      padding: 20px 24px; border-bottom: 1px solid var(--border);
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
      flex-shrink: 0;
    }
    .drawer-meta { display: flex; flex-direction: column; gap: 6px; }
    .drawer-eyebrow { display: flex; align-items: center; gap: 8px; }
    .drawer-title {
      font-family: var(--fd); font-weight: 800; font-size: 18px;
      color: var(--text); letter-spacing: -.5px; line-height: 1.3;
    }
    .drawer-actions {
      padding: 14px 24px; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex-shrink: 0;
    }
    .drawer-body { padding: 24px; overflow-y: auto; flex: 1; }
    .drawer-summary {
      font-family: var(--fb); font-size: 14px; color: var(--text-2);
      font-style: italic; line-height: 1.6; margin-bottom: 20px;
      padding-bottom: 20px; border-bottom: 1px solid var(--border);
    }
    .drawer-content {
      font-family: var(--fb); font-size: 15px; color: var(--text); line-height: 1.8;
    }
    .btn-close {
      background: none; border: none; cursor: pointer; padding: 4px;
      color: var(--text-3); font-size: 20px; line-height: 1;
      &:hover { color: var(--text); }
    }

    /* ── Edit modal ── */
    .modal {
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); width: min(640px, 95vw); max-height: 90vh;
      overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.3);
      animation: fadeUp .2s ease;
    }
    @keyframes fadeUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform:none; } }

    .modal-header {
      padding: 20px 24px 16px; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .modal-title {
      font-family: var(--fd); font-weight: 800; font-size: 18px;
      color: var(--text); letter-spacing: -.5px;
    }
    .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
    .modal-footer {
      padding: 16px 24px; border-top: 1px solid var(--border);
      display: flex; align-items: center; justify-content: flex-end; gap: 10px;
    }

    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label {
      font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .14em; text-transform: uppercase; color: var(--text-3);
    }
    .field input, .field textarea {
      font-family: var(--fb); font-size: 14px; color: var(--text);
      background: var(--bg); border: 1px solid var(--border);
      border-radius: var(--r); padding: 10px 12px;
      transition: border-color var(--t);
      &:focus { outline: none; border-color: var(--green); }
    }
    .field textarea { resize: vertical; min-height: 80px; }
    .field textarea.content-area { min-height: 240px; font-size: 13px; font-family: monospace; }

    .btn-primary {
      font-family: var(--fu); font-size: 12px; font-weight: 600; letter-spacing: .06em;
      background: var(--green); color: #fff; border: none;
      border-radius: var(--r); padding: 9px 20px; cursor: pointer; transition: all var(--t);
      &:hover { filter: brightness(1.1); }
      &:disabled { opacity: .4; cursor: not-allowed; }
    }
    .btn-cancel {
      font-family: var(--fu); font-size: 12px; font-weight: 600; letter-spacing: .06em;
      background: transparent; color: var(--text-3); border: 1.5px solid var(--border);
      border-radius: var(--r); padding: 9px 20px; cursor: pointer; transition: all var(--t);
      &:hover { border-color: var(--text-3); color: var(--text); }
    }

    /* ── Delete confirm ── */
    .confirm-modal {
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); width: min(440px, 95vw);
      box-shadow: 0 20px 60px rgba(0,0,0,.3);
      animation: fadeUp .2s ease; padding: 28px;
    }
    .confirm-icon { font-size: 32px; margin-bottom: 12px; }
    .confirm-title {
      font-family: var(--fd); font-weight: 800; font-size: 18px;
      color: var(--text); letter-spacing: -.5px; margin-bottom: 10px;
    }
    .confirm-body {
      font-family: var(--fb); font-size: 14px; color: var(--text-3);
      line-height: 1.6; margin-bottom: 24px;
    }
    .confirm-post-title {
      font-family: var(--fd); font-weight: 700; color: var(--text);
      font-style: italic;
    }
    .confirm-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-danger {
      font-family: var(--fu); font-size: 12px; font-weight: 600; letter-spacing: .06em;
      background: var(--coral); color: #fff; border: none;
      border-radius: var(--r); padding: 9px 20px; cursor: pointer; transition: all var(--t);
      &:hover { filter: brightness(1.1); }
      &:disabled { opacity: .4; cursor: not-allowed; }
    }

    @media (max-width: 900px) {
      .admin-header { flex-direction: column; align-items: flex-start; }
      .content { padding: 20px 1rem 60px; }
      .col-topic, .col-date { display: none; }
      .col-title { width: 55%; }
      .col-actions { width: 35%; }
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
          Todos <span *ngIf="activeFilter === 'ALL'" class="tab-count">{{ totalElements }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'DRAFT'" (click)="setFilter('DRAFT')">
          Draft <span *ngIf="activeFilter === 'DRAFT'" class="tab-count">{{ totalElements }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'PUBLISHED'" (click)="setFilter('PUBLISHED')">
          Publicados <span *ngIf="activeFilter === 'PUBLISHED'" class="tab-count">{{ totalElements }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'REJECTED'" (click)="setFilter('REJECTED')">
          Rejeitados <span *ngIf="activeFilter === 'REJECTED'" class="tab-count">{{ totalElements }}</span>
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
          <span class="results-label">{{ posts.length }} de {{ totalElements }} {{ totalElements === 1 ? 'post' : 'posts' }}</span>
        </div>

        <div *ngIf="posts.length === 0" class="state-empty">
          <span class="sep-short"></span>
          <p>Nenhum post {{ filterLabel }}</p>
        </div>

        <div class="table-wrapper" *ngIf="posts.length > 0">
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
              <tr *ngFor="let p of posts">
                <td>
                  <div class="post-title">{{ p.title }}</div>
                  <div class="post-slug">/{{ p.slug }}</div>
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
                    <button class="btn-action btn-view" (click)="openPreview(p)" title="Ver conteúdo">
                      Ver
                    </button>
                    <button class="btn-action btn-edit" (click)="openEdit(p)" title="Editar post">
                      Editar
                    </button>
                    <button
                      class="btn-action btn-approve"
                      *ngIf="p.status !== 'PUBLISHED'"
                      (click)="approve(p)"
                      [disabled]="pendingId === p.id">
                      {{ pendingId === p.id ? '...' : 'Publicar' }}
                    </button>
                    <button
                      class="btn-action btn-unpublish"
                      *ngIf="p.status === 'PUBLISHED'"
                      (click)="unpublish(p)"
                      [disabled]="pendingId === p.id">
                      {{ pendingId === p.id ? '...' : 'Despublicar' }}
                    </button>
                    <button
                      class="btn-action btn-reject"
                      *ngIf="p.status === 'DRAFT'"
                      (click)="reject(p)"
                      [disabled]="pendingId === p.id">
                      Rejeitar
                    </button>
                    <button
                      class="btn-action btn-delete"
                      (click)="confirmDelete(p)"
                      title="Excluir post">
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="load-more-wrapper" *ngIf="!last && posts.length > 0">
          <button class="btn-load-more" (click)="loadMore()" [disabled]="loadingMore">
            {{ loadingMore ? 'Carregando...' : 'Carregar mais' }}
          </button>
        </div>
      </ng-container>
    </div>

    <!-- Preview Drawer -->
    <ng-container *ngIf="previewPost">
      <div class="backdrop" (click)="closePreview()"></div>
      <aside class="preview-drawer">
        <div class="drawer-header">
          <div class="drawer-meta">
            <div class="drawer-eyebrow">
              <span class="tag"
                [class.tag-ghost]="previewPost.status === 'DRAFT'"
                [class.tag-green]="previewPost.status === 'PUBLISHED'"
                [class.tag-breaking]="previewPost.status === 'REJECTED'">
                {{ statusLabel(previewPost.status) }}
              </span>
              <span class="eyebrow-text">{{ previewPost.topicSlug }} · {{ formatDate(previewPost.createdAt) }}</span>
            </div>
            <h2 class="drawer-title">{{ previewPost.title }}</h2>
          </div>
          <button class="btn-close" (click)="closePreview()">✕</button>
        </div>
        <div class="drawer-actions">
          <button class="btn-action btn-edit" (click)="closePreview(); openEdit(previewPost)">Editar</button>
          <button
            class="btn-action btn-approve"
            *ngIf="previewPost.status !== 'PUBLISHED'"
            (click)="approve(previewPost); closePreview()">
            Publicar
          </button>
          <button
            class="btn-action btn-unpublish"
            *ngIf="previewPost.status === 'PUBLISHED'"
            (click)="unpublish(previewPost); closePreview()">
            Despublicar
          </button>
          <button
            class="btn-action btn-reject"
            *ngIf="previewPost.status === 'DRAFT'"
            (click)="reject(previewPost); closePreview()">
            Rejeitar
          </button>
          <a
            class="btn-action btn-view"
            *ngIf="previewPost.status === 'PUBLISHED'"
            [routerLink]="['/blog/posts', previewPost.slug]"
            target="_blank">
            Ver no blog →
          </a>
        </div>
        <div class="drawer-body">
          <p class="drawer-summary">{{ previewPost.summary }}</p>
          <div class="drawer-content" [innerHTML]="previewPost.content"></div>
        </div>
      </aside>
    </ng-container>

    <!-- Edit Modal -->
    <ng-container *ngIf="editPost">
      <div class="backdrop" (click)="closeEdit()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">Editar Post</span>
            <button class="btn-close" (click)="closeEdit()">✕</button>
          </div>
          <div class="modal-body">
            <div class="field">
              <label>Título</label>
              <input type="text" [(ngModel)]="editTitle" placeholder="Título do post" />
            </div>
            <div class="field">
              <label>Resumo</label>
              <textarea [(ngModel)]="editSummary" placeholder="Resumo curto..."></textarea>
            </div>
            <div class="field">
              <label>Conteúdo (HTML)</label>
              <textarea class="content-area" [(ngModel)]="editContent" placeholder="<p>Conteúdo HTML...</p>"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeEdit()">Cancelar</button>
            <button class="btn-primary" (click)="saveEdit()" [disabled]="savingEdit">
              {{ savingEdit ? 'Salvando...' : 'Salvar alterações' }}
            </button>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- Delete Confirmation -->
    <ng-container *ngIf="deleteTarget">
      <div class="backdrop" (click)="cancelDelete()">
        <div class="confirm-modal" (click)="$event.stopPropagation()">
          <div class="confirm-icon">🗑</div>
          <h3 class="confirm-title">Excluir post?</h3>
          <p class="confirm-body">
            Esta ação é irreversível. O post
            <span class="confirm-post-title">"{{ deleteTarget.title }}"</span>
            será permanentemente removido.
          </p>
          <div class="confirm-actions">
            <button class="btn-cancel" (click)="cancelDelete()">Cancelar</button>
            <button class="btn-danger" (click)="doDelete()" [disabled]="deleting">
              {{ deleting ? 'Excluindo...' : 'Sim, excluir' }}
            </button>
          </div>
        </div>
      </div>
    </ng-container>
  `
})
export class AdminPostsComponent implements OnInit {
  private api = inject(ApiService);

  posts: AdminPost[] = [];
  activeFilter: 'ALL' | PostStatus = 'ALL';
  loading = true;
  loadingMore = false;
  pendingId: number | null = null;
  page = 0;
  readonly pageSize = 20;
  totalElements = 0;
  last = false;

  previewPost: AdminPostDetail | null = null;
  editPost: AdminPostDetail | null = null;
  editTitle = '';
  editSummary = '';
  editContent = '';
  savingEdit = false;

  deleteTarget: AdminPost | null = null;
  deleting = false;

  get filterLabel(): string {
    const map: Record<string, string> = { ALL: '', DRAFT: 'em rascunho', PUBLISHED: 'publicado', REJECTED: 'rejeitado' };
    return map[this.activeFilter] ?? '';
  }

  ngOnInit(): void {
    this.fetchPosts(true);
  }

  setFilter(f: 'ALL' | PostStatus): void {
    this.activeFilter = f;
    this.fetchPosts(true);
  }

  loadMore(): void {
    this.page++;
    this.fetchPosts(false);
  }

  statusLabel(s: PostStatus): string {
    return { DRAFT: 'Draft', PUBLISHED: 'Publicado', REJECTED: 'Rejeitado' }[s];
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
  }

  openPreview(post: AdminPost): void {
    this.api.get<AdminPostDetail>(`/admin/posts/${post.id}`).subscribe({
      next: (detail) => { this.previewPost = detail; }
    });
  }

  closePreview(): void {
    this.previewPost = null;
  }

  openEdit(post: AdminPost): void {
    this.api.get<AdminPostDetail>(`/admin/posts/${post.id}`).subscribe({
      next: (detail) => {
        this.editPost = detail;
        this.editTitle = detail.title;
        this.editSummary = detail.summary;
        this.editContent = detail.content;
      }
    });
  }

  closeEdit(): void {
    this.editPost = null;
  }

  saveEdit(): void {
    if (!this.editPost) return;
    this.savingEdit = true;
    this.api.put<AdminPostDetail>(`/admin/posts/${this.editPost.id}`, {
      title: this.editTitle,
      summary: this.editSummary,
      content: this.editContent
    }).subscribe({
      next: (updated) => {
        const idx = this.posts.findIndex(p => p.id === updated.id);
        if (idx !== -1) {
          this.posts[idx] = { ...this.posts[idx], title: updated.title, summary: updated.summary };
        }
        this.savingEdit = false;
        this.editPost = null;
      },
      error: () => { this.savingEdit = false; }
    });
  }

  approve(post: AdminPost): void {
    this.pendingId = post.id;
    this.api.patch<{ status: PostStatus }>(`/admin/posts/${post.id}/approve`, {}).subscribe({
      next: () => {
        post.status = 'PUBLISHED';
        post.publishedAt = new Date().toISOString();
        this.pendingId = null;
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
      },
      error: () => { this.pendingId = null; }
    });
  }

  unpublish(post: AdminPost): void {
    this.pendingId = post.id;
    this.api.patch<{ status: PostStatus }>(`/admin/posts/${post.id}/unpublish`, {}).subscribe({
      next: () => {
        post.status = 'DRAFT';
        post.publishedAt = null;
        this.pendingId = null;
      },
      error: () => { this.pendingId = null; }
    });
  }

  confirmDelete(post: AdminPost): void {
    this.deleteTarget = post;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true;
    this.api.delete(`/admin/posts/${this.deleteTarget.id}`).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== this.deleteTarget!.id);
        this.totalElements--;
        this.deleting = false;
        this.deleteTarget = null;
      },
      error: () => { this.deleting = false; }
    });
  }

  private fetchPosts(reset: boolean): void {
    if (reset) {
      this.posts = [];
      this.page = 0;
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    const params: Record<string, string> = {
      page: String(this.page),
      size: String(this.pageSize)
    };
    if (this.activeFilter !== 'ALL') params['status'] = this.activeFilter;

    this.api.get<PageResponse<AdminPost>>('/admin/posts', params).subscribe({
      next: (res) => {
        this.posts = [...this.posts, ...res.content];
        this.totalElements = res.totalElements;
        this.last = res.last;
        this.loading = false;
        this.loadingMore = false;
      },
      error: () => {
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }
}
