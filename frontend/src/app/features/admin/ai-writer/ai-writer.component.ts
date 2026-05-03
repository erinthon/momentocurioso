import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';

interface QueuedArticle {
  id: number;
  title: string;
  sourceUrl: string;
  sourceSiteType: string;
  topicName: string;
  topicSlug: string;
  topicId: number;
  scrapedAt: string;
  queuedProviderName: string | null;
  queuedProviderId: number | null;
}

interface AiProvider {
  id: number;
  name: string;
  type: string;
  model: string;
  active: boolean;
}

interface TopicGroup {
  topicId: number;
  topicName: string;
  topicSlug: string;
  articles: QueuedArticle[];
  selectedProviderId: number | null;
  generating: boolean;
  result: GenerationResult | null;
  mockMode: boolean;
}

interface GenerationResult {
  success: boolean;
  postId: number | null;
  status: string;
  summary: string | null;
  errorMessage: string | null;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  last: boolean;
}

interface JobStatusResponse {
  id: number;
  status: string;
  postId: number | null;
  summary: string | null;
  errorMessage: string | null;
}

@Component({
  selector: 'app-admin-ai-writer',
  standalone: true,
  imports: [CommonModule, AdminNavbarComponent, RouterLink, FormsModule],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--bg); }

    /* ── Header ── */
    .admin-header {
      padding: 32px 2rem 24px;
      background: var(--bg-1); border-bottom: 1px solid var(--border);
      display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px;
    }
    .header-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .eyebrow-line { width: 24px; height: 2px; background: #2563eb; flex-shrink: 0; }
    .eyebrow-text {
      font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .18em; text-transform: uppercase; color: var(--text-3);
    }
    .admin-title {
      font-family: var(--fd); font-weight: 800; font-size: 32px;
      color: var(--text); letter-spacing: -1.2px;
    }
    .header-meta { font-family: var(--fu); font-size: 12px; color: var(--text-3); margin-top: 6px; }
    .queue-badge {
      font-family: var(--fu); font-size: 13px; font-weight: 700; letter-spacing: .04em;
      padding: 8px 18px; border-radius: 40px;
      background: rgba(37,99,235,.12); color: #2563eb; border: 1.5px solid rgba(37,99,235,.3);
    }

    /* ── Content ── */
    .content { padding: 32px 2rem 80px; max-width: 900px; margin: 0 auto; }

    /* ── States ── */
    .state-loading, .state-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; padding: 80px 0; text-align: center;
    }
    .state-loading p, .state-empty p {
      font-family: var(--fu); font-size: 12px; color: var(--text-4);
      letter-spacing: .1em; text-transform: uppercase;
    }
    .pulse-bar { width: 32px; height: 3px; background: #2563eb; border-radius: 2px; animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{width:32px;opacity:1} 50%{width:56px;opacity:.4} }
    .empty-link { font-family: var(--fu); font-size: 12px; color: #2563eb; text-decoration: none; &:hover { text-decoration: underline; } }

    /* ── Topic Groups ── */
    .topic-group { margin-bottom: 28px; }
    .group-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 16px 20px;
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r) var(--r) 0 0;
      border-bottom: none;
    }
    .group-title-wrap { display: flex; flex-direction: column; gap: 4px; }
    .group-eyebrow {
      font-family: var(--fu); font-size: 9px; font-weight: 700; letter-spacing: .18em;
      text-transform: uppercase; color: var(--text-4);
    }
    .group-title { font-family: var(--fd); font-weight: 800; font-size: 18px; color: var(--text); letter-spacing: -.5px; }
    .group-count { font-family: var(--fu); font-size: 11px; color: var(--text-4); margin-top: 2px; }

    /* ── Provider selector ── */
    .provider-selector {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }
    .provider-label { font-family: var(--fu); font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--text-4); }
    .provider-select {
      font-family: var(--fu); font-size: 12px; font-weight: 500; color: var(--text);
      background: var(--bg); border: 1.5px solid var(--border);
      border-radius: var(--r); padding: 6px 12px; cursor: pointer;
      transition: border-color var(--t); min-width: 200px;
      &:focus { outline: none; border-color: #2563eb; }
    }
    .btn-generate {
      font-family: var(--fu); font-size: 12px; font-weight: 700; letter-spacing: .04em;
      color: #fff; background: #2563eb; border: 1.5px solid #2563eb;
      border-radius: var(--r); padding: 8px 20px; cursor: pointer; transition: all var(--t);
      &:hover { background: #1d4ed8; border-color: #1d4ed8; }
      &:disabled { opacity: .4; cursor: not-allowed; }
    }

    /* ── Articles table in group ── */
    .group-table-wrapper {
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: 0 0 var(--r) var(--r);
    }
    .group-table { width: 100%; border-collapse: collapse; }
    .group-table th {
      font-family: var(--fu); font-size: 9px; font-weight: 700; letter-spacing: .14em;
      text-transform: uppercase; color: var(--text-4); text-align: left;
      padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--bg-2);
    }
    .group-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .group-table tr:last-child td { border-bottom: none; }
    .group-table tr:hover td { background: var(--bg-2); }
    .art-title { font-family: var(--fd); font-weight: 700; font-size: 13px; color: var(--text); letter-spacing: -.3px; }
    .art-url { font-family: var(--fu); font-size: 10px; color: var(--text-4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 340px; }
    .art-date { font-family: var(--fu); font-size: 11px; color: var(--text-4); }
    .art-provider {
      font-family: var(--fu); font-size: 10px; font-weight: 600;
      color: #2563eb; letter-spacing: .04em;
    }
    .src-chip {
      display: inline-block; font-family: var(--fu); font-size: 8px; font-weight: 700;
      letter-spacing: .1em; text-transform: uppercase; padding: 1px 5px; border-radius: 3px;
      &.rss { background: rgba(10,124,56,.12); color: var(--green); }
      &.html { background: var(--bg-2); color: var(--text-4); border: 1px solid var(--border); }
    }

    /* ── Generation result ── */
    .result-card {
      margin-top: 12px; padding: 16px 20px;
      border: 1.5px solid; border-radius: var(--r);
    }
    .result-success { border-color: rgba(10,124,56,.3); background: rgba(10,124,56,.06); }
    .result-error   { border-color: rgba(220,38,38,.3); background: rgba(220,38,38,.06); }
    .result-title {
      font-family: var(--fu); font-size: 11px; font-weight: 700; letter-spacing: .1em;
      text-transform: uppercase; margin-bottom: 6px;
    }
    .result-success .result-title { color: var(--green); }
    .result-error   .result-title { color: var(--coral); }
    .result-summary { font-family: var(--fu); font-size: 12px; color: var(--text-3); margin-bottom: 8px; }
    .result-link {
      font-family: var(--fu); font-size: 12px; font-weight: 600; color: var(--green);
      text-decoration: none; &:hover { text-decoration: underline; }
    }
    .result-error-msg { font-family: var(--fu); font-size: 11px; color: var(--coral); }

    /* ── Mock toggle ── */
    .mock-toggle { display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .mock-label {
      font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .12em; text-transform: uppercase; color: var(--text-3);
    }
    .mock-toggle input[type="checkbox"] { accent-color: #f59e0b; width: 14px; height: 14px; cursor: pointer; }

    /* ── Generating spinner ── */
    .generating-row {
      display: flex; align-items: center; gap: 12px; padding: 16px 20px;
      font-family: var(--fu); font-size: 12px; color: var(--text-4); letter-spacing: .06em;
    }
    .spin {
      width: 16px; height: 16px; border: 2px solid var(--border);
      border-top-color: #2563eb; border-radius: 50%;
      animation: spin .7s linear infinite; flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 700px) {
      .provider-selector { flex-direction: column; align-items: flex-start; }
      .provider-select { min-width: unset; width: 100%; }
    }
  `],
  template: `
    <app-admin-navbar />

    <div class="admin-header">
      <div>
        <div class="header-eyebrow">
          <span class="eyebrow-line"></span>
          <span class="eyebrow-text">Admin · Geração</span>
        </div>
        <h1 class="admin-title">IA Redatora</h1>
        <p class="header-meta">Artigos marcados para geração, agrupados por tópico</p>
      </div>
      <span class="queue-badge" *ngIf="!loading">
        {{ totalQueued }} artigo{{ totalQueued !== 1 ? 's' : '' }} na fila
      </span>
    </div>

    <div class="content">
      <div *ngIf="loading" class="state-loading">
        <span class="pulse-bar"></span>
        <p>Carregando fila...</p>
      </div>

      <div *ngIf="!loading && groups.length === 0" class="state-empty">
        <span class="pulse-bar" style="background:var(--border)"></span>
        <p>Nenhum artigo na fila</p>
        <a class="empty-link" routerLink="/admin/scraped-articles">
          → Ir para Artigos Raspados e marcar artigos para IA
        </a>
      </div>

      <div class="topic-group" *ngFor="let group of groups">
        <div class="group-header">
          <div class="group-title-wrap">
            <span class="group-eyebrow">Tópico</span>
            <span class="group-title">{{ group.topicName }}</span>
            <span class="group-count">{{ group.articles.length }} artigo{{ group.articles.length !== 1 ? 's' : '' }} na fila</span>
          </div>

          <div class="provider-selector" *ngIf="!group.generating && !group.result">
            <label class="mock-toggle">
              <input type="checkbox" [(ngModel)]="group.mockMode" [ngModelOptions]="{standalone:true}">
              <span class="mock-label">Modo mock (teste)</span>
            </label>
            <ng-container *ngIf="!group.mockMode">
              <span class="provider-label">Provider:</span>
              <select class="provider-select" [(ngModel)]="group.selectedProviderId" [ngModelOptions]="{standalone:true}">
                <option *ngFor="let p of providers" [value]="p.id">
                  {{ p.name }} ({{ p.model }}){{ p.active ? ' ✓' : '' }}
                </option>
              </select>
            </ng-container>
            <button
              class="btn-generate"
              [disabled]="!group.mockMode && !group.selectedProviderId"
              (click)="generate(group)">
              Gerar Post Rascunho
            </button>
          </div>

          <div class="generating-row" *ngIf="group.generating">
            <span class="spin"></span>
            {{ group.mockMode ? 'Gerando post mock...' : 'Gerando post via IA...' }}
          </div>
        </div>

        <div class="group-table-wrapper">
          <table class="group-table" *ngIf="!group.generating && !group.result">
            <thead>
              <tr>
                <th>Título do Artigo</th>
                <th>Tipo</th>
                <th>Provider Preferido</th>
                <th>Coletado em</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of group.articles">
                <td>
                  <div class="art-title">{{ a.title }}</div>
                  <div class="art-url">{{ a.sourceUrl }}</div>
                </td>
                <td><span class="src-chip" [class.rss]="a.sourceSiteType === 'RSS'" [class.html]="a.sourceSiteType === 'HTML'">{{ a.sourceSiteType }}</span></td>
                <td><span class="art-provider">{{ a.queuedProviderName || '—' }}</span></td>
                <td><span class="art-date">{{ formatDate(a.scrapedAt) }}</span></td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="group.result" class="result-card" [class.result-success]="group.result.success" [class.result-error]="!group.result.success">
            <div class="result-title">{{ group.result.success ? 'Post gerado com sucesso' : 'Falha na geração' }}</div>
            <div class="result-summary" *ngIf="group.result.summary">{{ group.result.summary }}</div>
            <a class="result-link" *ngIf="group.result.postId" routerLink="/admin/posts">
              → Ver rascunho em Admin Posts (ID #{{ group.result.postId }})
            </a>
            <div class="result-error-msg" *ngIf="group.result.errorMessage">{{ group.result.errorMessage }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminAiWriterComponent implements OnInit {
  private api = inject(ApiService);

  groups: TopicGroup[] = [];
  providers: AiProvider[] = [];
  loading = true;
  totalQueued = 0;

  ngOnInit(): void {
    this.api.get<AiProvider[]>('/admin/ai-providers').subscribe({
      next: (providers) => { this.providers = providers; },
      error: () => {}
    });

    this.api.get<PageResponse<QueuedArticle>>('/admin/ai-writer/queue', { size: '200' }).subscribe({
      next: (res) => {
        this.totalQueued = res.totalElements;
        this.groups = this.buildGroups(res.content);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  generate(group: TopicGroup): void {
    if (!group.mockMode && !group.selectedProviderId) return;
    group.generating = true;
    group.result = null;

    const articleIds = group.articles.map(a => a.id);
    this.api.post<JobStatusResponse>('/admin/ai-writer/generate', {
      topicId: group.topicId,
      aiProviderId: group.mockMode ? null : group.selectedProviderId,
      articleIds,
      mock: group.mockMode
    }).subscribe({
      next: (job) => {
        group.generating = false;
        group.result = {
          success: job.status === 'DONE',
          postId: job.postId,
          status: job.status,
          summary: job.summary,
          errorMessage: job.errorMessage
        };
        if (job.status === 'DONE') {
          this.totalQueued = Math.max(0, this.totalQueued - articleIds.length);
        }
      },
      error: (err) => {
        group.generating = false;
        group.result = {
          success: false,
          postId: null,
          status: 'FAILED',
          summary: null,
          errorMessage: err?.error?.message || 'Erro desconhecido'
        };
      }
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
  }

  private buildGroups(articles: QueuedArticle[]): TopicGroup[] {
    const map = new Map<number, TopicGroup>();
    for (const a of articles) {
      if (!map.has(a.topicId)) {
        const suggestedProvider = this.providers.find(p => p.active)?.id
          ?? (a.queuedProviderId ?? null);
        map.set(a.topicId, {
          topicId: a.topicId,
          topicName: a.topicName,
          topicSlug: a.topicSlug,
          articles: [],
          selectedProviderId: a.queuedProviderId ?? suggestedProvider,
          generating: false,
          result: null,
          mockMode: false
        });
      }
      map.get(a.topicId)!.articles.push(a);
    }
    return Array.from(map.values());
  }
}
