import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface ScrapedArticle {
  id: number;
  sourceSiteId: number;
  sourceSiteUrl: string;
  sourceSiteType: string;
  title: string;
  content: string;
  sourceUrl: string;
  scrapedAt: string;
  used: boolean;
  approvalStatus: ApprovalStatus;
  topicName: string;
  topicSlug: string;
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
  selector: 'app-admin-scraped-articles',
  standalone: true,
  imports: [CommonModule, AdminNavbarComponent],
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
    .articles-table { width: 100%; border-collapse: collapse; }
    .articles-table th {
      font-family: var(--fu); font-size: 10px; font-weight: 600; letter-spacing: .14em;
      color: var(--text-4); text-transform: uppercase; text-align: left;
      padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--bg-1);
    }
    .articles-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .articles-table tr:last-child td { border-bottom: none; }
    .articles-table tr:hover td { background: var(--bg-2); }

    .col-title { width: 28%; }
    .col-source { width: 18%; }
    .col-topic { width: 10%; }
    .col-status { width: 10%; }
    .col-date { width: 10%; }
    .col-used { width: 6%; }
    .col-actions { width: 18%; text-align: right; }
    .source-cell { display: flex; flex-direction: column; gap: 3px; }
    .source-type-chip {
      display: inline-block; font-family: var(--fu); font-size: 9px; font-weight: 700;
      letter-spacing: .1em; text-transform: uppercase; padding: 1px 6px;
      border-radius: 3px; width: fit-content;
      &.type-rss { background: rgba(10,124,56,.12); color: var(--green); }
      &.type-html { background: var(--bg-2); color: var(--text-4); border: 1px solid var(--border); }
    }
    .source-url-link {
      font-family: var(--fu); font-size: 10px; color: var(--text-4); letter-spacing: .03em;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;
      text-decoration: none; display: block;
      &:hover { color: var(--green); }
    }

    .article-title {
      font-family: var(--fd); font-weight: 700; font-size: 13px;
      color: var(--text); letter-spacing: -.3px; line-height: 1.3; margin-bottom: 2px;
      cursor: pointer;
      &:hover { color: var(--green); }
    }
    .article-url {
      font-family: var(--fu); font-size: 10px; color: var(--text-4); letter-spacing: .04em;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 320px;
    }
    .topic-label { font-family: var(--fu); font-size: 11px; font-weight: 600; color: var(--text-3); letter-spacing: .06em; }
    .date-val { font-family: var(--fu); font-size: 11px; color: var(--text-4); letter-spacing: .06em; }
    .used-val { font-family: var(--fu); font-size: 11px; color: var(--text-4); text-align: center; }

    .actions { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
    .btn-action {
      font-family: var(--fu); font-size: 11px; font-weight: 600; letter-spacing: .04em;
      border-radius: var(--r); padding: 5px 11px; cursor: pointer;
      border: 1.5px solid; transition: all var(--t); white-space: nowrap;
    }
    .btn-view {
      color: var(--text-3); border-color: var(--border); background: transparent;
      &:hover { color: var(--green); border-color: var(--green); background: var(--green-pale); }
    }
    .btn-approve {
      color: var(--green); border-color: var(--green); background: transparent;
      &:hover { background: var(--green); color: #fff; }
    }
    .btn-reject {
      color: var(--coral); border-color: rgba(220,38,38,.4); background: transparent;
      &:hover { background: var(--coral); color: #fff; border-color: var(--coral); }
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

    /* ── Preview drawer ── */
    .backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      backdrop-filter: blur(2px); z-index: 100;
    }
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
    .drawer-meta { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .drawer-eyebrow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .drawer-title {
      font-family: var(--fd); font-weight: 800; font-size: 18px;
      color: var(--text); letter-spacing: -.5px; line-height: 1.3;
    }
    .drawer-source {
      font-family: var(--fu); font-size: 10px; color: var(--text-4); letter-spacing: .04em;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .drawer-actions {
      padding: 14px 24px; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex-shrink: 0;
    }
    .drawer-body { padding: 24px; overflow-y: auto; flex: 1; }
    .drawer-content {
      font-family: var(--fb); font-size: 15px; color: var(--text); line-height: 1.8;
      white-space: pre-wrap; word-break: break-word;
    }
    .btn-close {
      background: none; border: none; cursor: pointer; padding: 4px;
      color: var(--text-3); font-size: 20px; line-height: 1; flex-shrink: 0;
      &:hover { color: var(--text); }
    }

    @media (max-width: 900px) {
      .admin-header { flex-direction: column; align-items: flex-start; }
      .content { padding: 20px 1rem 60px; }
      .col-topic, .col-date, .col-used, .col-source { display: none; }
      .col-title { width: 60%; }
      .col-actions { width: 30%; }
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
        <h1 class="admin-title">Artigos Raspados</h1>
      </div>
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="activeFilter === 'ALL'" (click)="setFilter('ALL')">
          Todos <span *ngIf="activeFilter === 'ALL'" class="tab-count">{{ totalElements }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'PENDING'" (click)="setFilter('PENDING')">
          Pendentes <span *ngIf="activeFilter === 'PENDING'" class="tab-count">{{ totalElements }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'APPROVED'" (click)="setFilter('APPROVED')">
          Aprovados <span *ngIf="activeFilter === 'APPROVED'" class="tab-count">{{ totalElements }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'REJECTED'" (click)="setFilter('REJECTED')">
          Rejeitados <span *ngIf="activeFilter === 'REJECTED'" class="tab-count">{{ totalElements }}</span>
        </button>
      </div>
    </div>

    <div class="content">
      <div *ngIf="loading" class="state-loading">
        <span class="pulse-bar"></span>
        <p>Carregando artigos...</p>
      </div>

      <ng-container *ngIf="!loading">
        <div class="results-bar">
          <span class="sep-short"></span>
          <span class="results-label">{{ articles.length }} de {{ totalElements }} artigo{{ totalElements !== 1 ? 's' : '' }}</span>
        </div>

        <div *ngIf="articles.length === 0" class="state-empty">
          <span class="sep-short"></span>
          <p>Nenhum artigo {{ filterLabel }}</p>
        </div>

        <div class="table-wrapper" *ngIf="articles.length > 0">
          <table class="articles-table">
            <thead>
              <tr>
                <th class="col-title">Título</th>
                <th class="col-source">Fonte</th>
                <th class="col-topic">Tópico</th>
                <th class="col-status">Status</th>
                <th class="col-date">Coletado em</th>
                <th class="col-used">Usado</th>
                <th class="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of articles">
                <td>
                  <div class="article-title" (click)="openPreview(a)">{{ a.title }}</div>
                  <div class="article-url" [title]="a.sourceUrl">{{ a.sourceUrl }}</div>
                </td>
                <td>
                  <div class="source-cell">
                    <span class="source-type-chip" [class.type-rss]="a.sourceSiteType === 'RSS'" [class.type-html]="a.sourceSiteType === 'HTML'">
                      {{ a.sourceSiteType }}
                    </span>
                    <a class="source-url-link" [href]="a.sourceSiteUrl" target="_blank" rel="noopener" [title]="a.sourceSiteUrl">
                      {{ a.sourceSiteUrl }}
                    </a>
                  </div>
                </td>
                <td>
                  <span class="topic-label">{{ a.topicSlug }}</span>
                </td>
                <td>
                  <span class="tag" [ngClass]="statusClass(a.approvalStatus)">
                    {{ statusLabel(a.approvalStatus) }}
                  </span>
                </td>
                <td>
                  <span class="date-val">{{ formatDate(a.scrapedAt) }}</span>
                </td>
                <td>
                  <span class="used-val">{{ a.used ? '✓' : '—' }}</span>
                </td>
                <td>
                  <div class="actions">
                    <button class="btn-action btn-view" (click)="openPreview(a)">Ver</button>
                    <button
                      class="btn-action btn-approve"
                      *ngIf="a.approvalStatus === 'PENDING'"
                      (click)="approve(a)"
                      [disabled]="pendingId === a.id">
                      {{ pendingId === a.id ? '...' : 'Aprovar' }}
                    </button>
                    <button
                      class="btn-action btn-reject"
                      *ngIf="a.approvalStatus === 'PENDING'"
                      (click)="reject(a)"
                      [disabled]="pendingId === a.id">
                      Rejeitar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="load-more-wrapper" *ngIf="!last && articles.length > 0">
          <button class="btn-load-more" (click)="loadMore()" [disabled]="loadingMore">
            {{ loadingMore ? 'Carregando...' : 'Carregar mais' }}
          </button>
        </div>
      </ng-container>
    </div>

    <!-- Preview Drawer -->
    <ng-container *ngIf="previewArticle">
      <div class="backdrop" (click)="closePreview()"></div>
      <aside class="preview-drawer">
        <div class="drawer-header">
          <div class="drawer-meta">
            <div class="drawer-eyebrow">
              <span class="tag" [ngClass]="statusClass(previewArticle.approvalStatus)">
                {{ statusLabel(previewArticle.approvalStatus) }}
              </span>
              <span class="eyebrow-text">{{ previewArticle.topicName }} · {{ formatDate(previewArticle.scrapedAt) }}</span>
              <span *ngIf="previewArticle.used" class="tag tag-ghost">Usado pela IA</span>
            </div>
            <h2 class="drawer-title">{{ previewArticle.title }}</h2>
            <span class="drawer-source">{{ previewArticle.sourceUrl }}</span>
          </div>
          <button class="btn-close" (click)="closePreview()">✕</button>
        </div>
        <div class="drawer-actions" *ngIf="previewArticle.approvalStatus === 'PENDING'">
          <button class="btn-action btn-approve" (click)="approve(previewArticle); closePreview()">
            Aprovar
          </button>
          <button class="btn-action btn-reject" (click)="reject(previewArticle); closePreview()">
            Rejeitar
          </button>
        </div>
        <div class="drawer-body">
          <p class="drawer-content">{{ previewArticle.content }}</p>
        </div>
      </aside>
    </ng-container>
  `
})
export class AdminScrapedArticlesComponent implements OnInit {
  private api = inject(ApiService);

  articles: ScrapedArticle[] = [];
  activeFilter: 'ALL' | ApprovalStatus = 'ALL';
  loading = true;
  loadingMore = false;
  pendingId: number | null = null;
  page = 0;
  readonly pageSize = 20;
  totalElements = 0;
  last = false;

  previewArticle: ScrapedArticle | null = null;

  get filterLabel(): string {
    const map: Record<string, string> = { ALL: '', PENDING: 'pendente', APPROVED: 'aprovado', REJECTED: 'rejeitado' };
    return map[this.activeFilter] ?? '';
  }

  ngOnInit(): void {
    this.fetchArticles(true);
  }

  setFilter(f: 'ALL' | ApprovalStatus): void {
    this.activeFilter = f;
    this.fetchArticles(true);
  }

  loadMore(): void {
    this.page++;
    this.fetchArticles(false);
  }

  statusLabel(s: ApprovalStatus): string {
    return { PENDING: 'Pendente', APPROVED: 'Aprovado', REJECTED: 'Rejeitado' }[s];
  }

  statusClass(s: ApprovalStatus): string {
    return { PENDING: 'tag-amber', APPROVED: 'tag-green', REJECTED: 'tag-ghost' }[s];
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
  }

  openPreview(article: ScrapedArticle): void {
    this.previewArticle = article;
  }

  closePreview(): void {
    this.previewArticle = null;
  }

  approve(article: ScrapedArticle): void {
    this.pendingId = article.id;
    this.api.patch<ScrapedArticle>(`/admin/scraped-articles/${article.id}/approve`, {}).subscribe({
      next: (updated) => {
        article.approvalStatus = updated.approvalStatus;
        this.pendingId = null;
      },
      error: () => { this.pendingId = null; }
    });
  }

  reject(article: ScrapedArticle): void {
    this.pendingId = article.id;
    this.api.patch<ScrapedArticle>(`/admin/scraped-articles/${article.id}/reject`, {}).subscribe({
      next: (updated) => {
        article.approvalStatus = updated.approvalStatus;
        this.pendingId = null;
      },
      error: () => { this.pendingId = null; }
    });
  }

  private fetchArticles(reset: boolean): void {
    if (reset) {
      this.articles = [];
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

    this.api.get<PageResponse<ScrapedArticle>>('/admin/scraped-articles', params).subscribe({
      next: (res) => {
        this.articles = [...this.articles, ...res.content];
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
