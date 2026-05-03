import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'QUEUED' | 'REJECTED';

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
  topicId: number;
  queuedProviderId: number | null;
  queuedProviderName: string | null;
}

interface Topic {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

interface SourceSite {
  id: number;
  url: string;
  type: string;
}

interface AiProvider {
  id: number;
  name: string;
  type: string;
  model: string;
  active: boolean;
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
  imports: [CommonModule, AdminNavbarComponent, FormsModule],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--bg); }

    /* ── Header ── */
    .admin-header {
      padding: 32px 2rem 24px;
      background: var(--bg-1); border-bottom: 1px solid var(--border);
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
      border-radius: 40px; padding: 7px 16px; cursor: pointer; transition: all var(--t); white-space: nowrap;
      &:hover { background: var(--green-pale); color: var(--green); border-color: var(--green); }
      &.active { background: var(--green); color: #fff; border-color: var(--green); }
    }
    .tab-count { font-family: var(--fu); font-size: 10px; font-weight: 500; opacity: .7; margin-left: 4px; }

    /* ── Two-panel layout ── */
    .layout { display: flex; align-items: flex-start; min-height: calc(100vh - 64px - 120px); }

    /* ── Sidebar ── */
    .sidebar {
      width: 240px; flex-shrink: 0; border-right: 1px solid var(--border);
      background: var(--bg-1); min-height: 100%; padding: 16px 0; position: sticky; top: 64px;
    }
    .sidebar-section-title {
      font-family: var(--fu); font-size: 9px; font-weight: 700; letter-spacing: .18em;
      text-transform: uppercase; color: var(--text-4); padding: 8px 16px 4px;
    }
    .sidebar-item {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px; cursor: pointer; transition: background var(--t);
      font-family: var(--fu); font-size: 12px; font-weight: 500; color: var(--text-3);
      border-left: 2px solid transparent;
      &:hover { background: var(--bg-2); color: var(--text); }
      &.active { background: var(--green-pale); color: var(--green); border-left-color: var(--green); font-weight: 600; }
    }
    .sidebar-topic { justify-content: space-between; }
    .sidebar-source { padding-left: 28px; font-size: 11px; }
    .topic-caret { font-size: 9px; transition: transform var(--t); &.open { transform: rotate(90deg); } }
    .source-chip {
      font-family: var(--fu); font-size: 8px; font-weight: 700; letter-spacing: .1em;
      text-transform: uppercase; padding: 1px 5px; border-radius: 3px;
      &.rss { background: rgba(10,124,56,.12); color: var(--green); }
      &.html { background: var(--bg-2); color: var(--text-4); border: 1px solid var(--border); }
    }

    /* ── Main content ── */
    .main { flex: 1; padding: 24px 2rem 80px; min-width: 0; }

    .results-bar { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
    .results-label {
      font-family: var(--fu); font-size: 11px; font-weight: 600;
      color: var(--text-3); letter-spacing: .1em; text-transform: uppercase;
    }

    /* ── Table ── */
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
    .articles-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .articles-table tr:last-child td { border-bottom: none; }
    .articles-table tr:hover td { background: var(--bg-2); }

    .col-title { width: 30%; }
    .col-source { width: 16%; }
    .col-topic { width: 10%; }
    .col-status { width: 14%; }
    .col-date { width: 10%; }
    .col-used { width: 5%; }
    .col-actions { width: 15%; text-align: right; }

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
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px;
      text-decoration: none; display: block;
      &:hover { color: var(--green); }
    }
    .article-title {
      font-family: var(--fd); font-weight: 700; font-size: 13px;
      color: var(--text); letter-spacing: -.3px; line-height: 1.3; margin-bottom: 2px;
      cursor: pointer; &:hover { color: var(--green); }
    }
    .article-url {
      font-family: var(--fu); font-size: 10px; color: var(--text-4); letter-spacing: .04em;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 280px;
    }
    .topic-label { font-family: var(--fu); font-size: 11px; font-weight: 600; color: var(--text-3); letter-spacing: .06em; }
    .date-val { font-family: var(--fu); font-size: 11px; color: var(--text-4); letter-spacing: .06em; }
    .used-val { font-family: var(--fu); font-size: 11px; color: var(--text-4); text-align: center; }

    /* ── Status chips ── */
    .status-chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-family: var(--fu); font-size: 10px; font-weight: 700; letter-spacing: .08em;
      text-transform: uppercase; padding: 3px 8px; border-radius: 40px;
    }
    .chip-pending  { background: rgba(217,119,6,.12); color: #b45309; border: 1px solid rgba(217,119,6,.3); }
    .chip-approved { background: rgba(10,124,56,.12);  color: var(--green); border: 1px solid rgba(10,124,56,.3); }
    .chip-queued   { background: rgba(37,99,235,.12);  color: #2563eb; border: 1px solid rgba(37,99,235,.3); }
    .chip-rejected { background: var(--bg-2); color: var(--text-4); border: 1px solid var(--border); }
    .chip-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
    .queued-provider { font-family: var(--fu); font-size: 9px; color: #2563eb; margin-top: 2px; letter-spacing: .04em; }

    /* ── Action buttons ── */
    .actions { display: flex; align-items: center; gap: 5px; justify-content: flex-end; }
    .btn-action {
      font-family: var(--fu); font-size: 10px; font-weight: 600; letter-spacing: .04em;
      border-radius: var(--r); padding: 4px 9px; cursor: pointer;
      border: 1.5px solid; transition: all var(--t); white-space: nowrap;
    }
    .btn-view {
      color: var(--text-3); border-color: var(--border); background: transparent;
      &:hover { color: var(--green); border-color: var(--green); background: var(--green-pale); }
    }
    .btn-queue {
      color: #2563eb; border-color: rgba(37,99,235,.4); background: transparent;
      &:hover { background: rgba(37,99,235,.1); }
    }
    .btn-reject {
      color: var(--coral); border-color: rgba(220,38,38,.4); background: transparent;
      &:hover { background: var(--coral); color: #fff; border-color: var(--coral); }
    }
    .btn-action:disabled { opacity: .35; cursor: not-allowed; }

    /* ── States ── */
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

    /* ── Preview Drawer ── */
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
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-shrink: 0;
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

    /* ── Queue Modal ── */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.6);
      backdrop-filter: blur(3px); z-index: 200;
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .modal {
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); width: 100%; max-width: 480px;
      box-shadow: 0 24px 64px rgba(0,0,0,.3);
      animation: modalIn .18s ease;
    }
    @keyframes modalIn { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .modal-header {
      padding: 20px 24px 16px; border-bottom: 1px solid var(--border);
      display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
    }
    .modal-title { font-family: var(--fd); font-weight: 800; font-size: 18px; color: var(--text); letter-spacing: -.5px; }
    .modal-subtitle { font-family: var(--fu); font-size: 11px; color: var(--text-4); margin-top: 4px; }
    .modal-body { padding: 20px 24px; }
    .field-label {
      font-family: var(--fu); font-size: 10px; font-weight: 700; letter-spacing: .14em;
      text-transform: uppercase; color: var(--text-3); margin-bottom: 8px; display: block;
    }
    .provider-list { display: flex; flex-direction: column; gap: 8px; }
    .provider-option {
      display: flex; align-items: center; gap: 12px; padding: 12px 14px;
      border: 1.5px solid var(--border); border-radius: var(--r);
      cursor: pointer; transition: all var(--t);
      &:hover { border-color: #2563eb; background: rgba(37,99,235,.05); }
      &.selected { border-color: #2563eb; background: rgba(37,99,235,.08); }
    }
    .provider-radio {
      width: 16px; height: 16px; border: 1.5px solid var(--border);
      border-radius: 50%; flex-shrink: 0; transition: all var(--t);
      display: flex; align-items: center; justify-content: center;
      .provider-option.selected & { border-color: #2563eb; background: #2563eb; }
    }
    .provider-radio-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; display: none; .provider-option.selected & { display: block; } }
    .provider-info { flex: 1; min-width: 0; }
    .provider-name { font-family: var(--fd); font-weight: 700; font-size: 13px; color: var(--text); }
    .provider-meta { font-family: var(--fu); font-size: 10px; color: var(--text-4); margin-top: 2px; }
    .provider-active-badge {
      font-family: var(--fu); font-size: 8px; font-weight: 700; letter-spacing: .1em;
      text-transform: uppercase; padding: 2px 6px; border-radius: 3px;
      background: rgba(10,124,56,.12); color: var(--green); border: 1px solid rgba(10,124,56,.3);
    }
    .modal-footer {
      padding: 16px 24px; border-top: 1px solid var(--border);
      display: flex; justify-content: flex-end; gap: 8px;
    }
    .btn-cancel {
      font-family: var(--fu); font-size: 12px; font-weight: 600; letter-spacing: .04em;
      color: var(--text-3); background: transparent; border: 1.5px solid var(--border);
      border-radius: var(--r); padding: 8px 18px; cursor: pointer; transition: all var(--t);
      &:hover { border-color: var(--text-3); color: var(--text); }
    }
    .btn-confirm {
      font-family: var(--fu); font-size: 12px; font-weight: 700; letter-spacing: .04em;
      color: #fff; background: #2563eb; border: 1.5px solid #2563eb;
      border-radius: var(--r); padding: 8px 20px; cursor: pointer; transition: all var(--t);
      &:hover { background: #1d4ed8; border-color: #1d4ed8; }
      &:disabled { opacity: .4; cursor: not-allowed; }
    }

    @media (max-width: 900px) {
      .layout { flex-direction: column; }
      .sidebar { width: 100%; position: static; border-right: none; border-bottom: 1px solid var(--border); }
      .admin-header { flex-direction: column; align-items: flex-start; }
      .main { padding: 20px 1rem 60px; }
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
        <button class="tab-btn" [class.active]="activeFilter === 'QUEUED'" (click)="setFilter('QUEUED')">
          Na Fila <span *ngIf="activeFilter === 'QUEUED'" class="tab-count">{{ totalElements }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'APPROVED'" (click)="setFilter('APPROVED')">
          Aprovados <span *ngIf="activeFilter === 'APPROVED'" class="tab-count">{{ totalElements }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'REJECTED'" (click)="setFilter('REJECTED')">
          Rejeitados <span *ngIf="activeFilter === 'REJECTED'" class="tab-count">{{ totalElements }}</span>
        </button>
      </div>
    </div>

    <div class="layout">
      <!-- Sidebar: Topics + Sources -->
      <aside class="sidebar">
        <div class="sidebar-section-title">Filtrar por fonte</div>

        <div class="sidebar-item" [class.active]="!selectedTopicId && !selectedSourceId" (click)="clearFilter()">
          Todos os tópicos
        </div>

        <ng-container *ngFor="let topic of topics">
          <div class="sidebar-item sidebar-topic" (click)="selectTopic(topic)" [class.active]="selectedTopicId === topic.id && !selectedSourceId">
            <span>{{ topic.name }}</span>
            <span class="topic-caret" [class.open]="expandedTopicId === topic.id">▶</span>
          </div>

          <ng-container *ngIf="expandedTopicId === topic.id">
            <div *ngIf="loadingSources" class="sidebar-item sidebar-source" style="color:var(--text-4)">
              Carregando...
            </div>
            <div class="sidebar-item sidebar-source"
                 *ngFor="let src of sourcesMap[topic.id]"
                 [class.active]="selectedSourceId === src.id"
                 (click)="selectSource(topic, src); $event.stopPropagation()">
              <span class="source-chip" [class.rss]="src.type === 'RSS'" [class.html]="src.type === 'HTML'">{{ src.type }}</span>
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0">{{ src.url }}</span>
            </div>
          </ng-container>
        </ng-container>
      </aside>

      <!-- Main: Article table -->
      <div class="main">
        <div *ngIf="loading" class="state-loading">
          <span class="pulse-bar"></span>
          <p>Carregando artigos...</p>
        </div>

        <ng-container *ngIf="!loading">
          <div class="results-bar">
            <span class="results-label">{{ articles.length }} de {{ totalElements }} artigo{{ totalElements !== 1 ? 's' : '' }}</span>
          </div>

          <div *ngIf="articles.length === 0" class="state-empty">
            <span class="pulse-bar" style="background:var(--border)"></span>
            <p>Nenhum artigo encontrado</p>
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
                  <th class="col-used">Uso</th>
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
                  <td><span class="topic-label">{{ a.topicSlug }}</span></td>
                  <td>
                    <span class="status-chip" [ngClass]="statusClass(a.approvalStatus)">
                      <span class="chip-dot"></span>
                      {{ statusLabel(a.approvalStatus) }}
                    </span>
                    <div class="queued-provider" *ngIf="a.approvalStatus === 'QUEUED' && a.queuedProviderName">
                      → {{ a.queuedProviderName }}
                    </div>
                  </td>
                  <td><span class="date-val">{{ formatDate(a.scrapedAt) }}</span></td>
                  <td><span class="used-val">{{ a.used ? '✓' : '—' }}</span></td>
                  <td>
                    <div class="actions">
                      <button class="btn-action btn-view" (click)="openPreview(a)">Ver</button>
                      <button
                        class="btn-action btn-queue"
                        *ngIf="a.approvalStatus !== 'REJECTED' && a.approvalStatus !== 'APPROVED'"
                        (click)="openQueueModal(a)"
                        [disabled]="pendingId === a.id">
                        {{ a.approvalStatus === 'QUEUED' ? 'Alterar IA' : 'Marcar para IA' }}
                      </button>
                      <button
                        class="btn-action btn-reject"
                        *ngIf="a.approvalStatus === 'PENDING' || a.approvalStatus === 'QUEUED'"
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
    </div>

    <!-- Preview Drawer -->
    <ng-container *ngIf="previewArticle">
      <div class="backdrop" (click)="closePreview()"></div>
      <aside class="preview-drawer">
        <div class="drawer-header">
          <div class="drawer-meta">
            <div class="drawer-eyebrow">
              <span class="status-chip" [ngClass]="statusClass(previewArticle.approvalStatus)">
                <span class="chip-dot"></span>{{ statusLabel(previewArticle.approvalStatus) }}
              </span>
              <span class="eyebrow-text">{{ previewArticle.topicName }} · {{ formatDate(previewArticle.scrapedAt) }}</span>
              <span *ngIf="previewArticle.used" class="status-chip chip-approved">Usado pela IA</span>
            </div>
            <h2 class="drawer-title">{{ previewArticle.title }}</h2>
            <span class="drawer-source">{{ previewArticle.sourceUrl }}</span>
          </div>
          <button class="btn-close" (click)="closePreview()">✕</button>
        </div>
        <div class="drawer-actions" *ngIf="previewArticle.approvalStatus !== 'REJECTED' && !previewArticle.used">
          <button
            class="btn-action btn-queue"
            *ngIf="previewArticle.approvalStatus !== 'APPROVED'"
            (click)="openQueueModal(previewArticle); closePreview()">
            {{ previewArticle.approvalStatus === 'QUEUED' ? 'Alterar IA' : 'Marcar para IA' }}
          </button>
          <button
            class="btn-action btn-reject"
            *ngIf="previewArticle.approvalStatus === 'PENDING' || previewArticle.approvalStatus === 'QUEUED'"
            (click)="reject(previewArticle); closePreview()">
            Rejeitar
          </button>
        </div>
        <div class="drawer-body">
          <p class="drawer-content">{{ previewArticle.content }}</p>
        </div>
      </aside>
    </ng-container>

    <!-- Queue Modal -->
    <div class="modal-overlay" *ngIf="queueModal.open" (click)="closeQueueModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <div class="modal-title">Marcar para IA Redatora</div>
            <div class="modal-subtitle">{{ queueModal.article?.title }}</div>
          </div>
          <button class="btn-close" (click)="closeQueueModal()">✕</button>
        </div>
        <div class="modal-body">
          <span class="field-label">Selecione o provider de IA</span>
          <div *ngIf="loadingProviders" style="font-family:var(--fu);font-size:12px;color:var(--text-4)">Carregando providers...</div>
          <div class="provider-list" *ngIf="!loadingProviders">
            <div
              class="provider-option"
              *ngFor="let p of providers"
              [class.selected]="queueModal.selectedProviderId === p.id"
              (click)="queueModal.selectedProviderId = p.id">
              <div class="provider-radio">
                <span class="provider-radio-dot"></span>
              </div>
              <div class="provider-info">
                <div class="provider-name">{{ p.name }}</div>
                <div class="provider-meta">{{ p.type }} · {{ p.model }}</div>
              </div>
              <span class="provider-active-badge" *ngIf="p.active">Ativo</span>
            </div>
            <div *ngIf="providers.length === 0" style="font-family:var(--fu);font-size:12px;color:var(--text-4)">
              Nenhum provider cadastrado. Adicione um em Providers.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="closeQueueModal()">Cancelar</button>
          <button
            class="btn-confirm"
            [disabled]="!queueModal.selectedProviderId || queueModal.loading"
            (click)="confirmQueue()">
            {{ queueModal.loading ? 'Marcando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminScrapedArticlesComponent implements OnInit {
  private api = inject(ApiService);

  articles: ScrapedArticle[] = [];
  topics: Topic[] = [];
  sourcesMap: Record<number, SourceSite[]> = {};
  providers: AiProvider[] = [];

  activeFilter: 'ALL' | ApprovalStatus = 'ALL';
  selectedTopicId: number | null = null;
  selectedSourceId: number | null = null;
  expandedTopicId: number | null = null;

  loading = true;
  loadingMore = false;
  loadingSources = false;
  loadingProviders = false;
  pendingId: number | null = null;

  page = 0;
  readonly pageSize = 20;
  totalElements = 0;
  last = false;

  previewArticle: ScrapedArticle | null = null;

  queueModal: {
    open: boolean;
    article: ScrapedArticle | null;
    selectedProviderId: number | null;
    loading: boolean;
  } = { open: false, article: null, selectedProviderId: null, loading: false };

  ngOnInit(): void {
    this.loadTopics();
    this.loadProviders();
    this.fetchArticles(true);
  }

  setFilter(f: 'ALL' | ApprovalStatus): void {
    this.activeFilter = f;
    this.fetchArticles(true);
  }

  clearFilter(): void {
    this.selectedTopicId = null;
    this.selectedSourceId = null;
    this.expandedTopicId = null;
    this.fetchArticles(true);
  }

  selectTopic(topic: Topic): void {
    if (this.expandedTopicId === topic.id) {
      this.expandedTopicId = null;
    } else {
      this.expandedTopicId = topic.id;
      this.loadSources(topic.id);
    }
    this.selectedTopicId = topic.id;
    this.selectedSourceId = null;
    this.fetchArticles(true);
  }

  selectSource(topic: Topic, src: SourceSite): void {
    this.selectedTopicId = topic.id;
    this.selectedSourceId = src.id;
    this.fetchArticles(true);
  }

  loadMore(): void {
    this.page++;
    this.fetchArticles(false);
  }

  openPreview(article: ScrapedArticle): void { this.previewArticle = article; }
  closePreview(): void { this.previewArticle = null; }

  openQueueModal(article: ScrapedArticle): void {
    this.queueModal = {
      open: true,
      article,
      selectedProviderId: article.queuedProviderId ?? (this.providers.find(p => p.active)?.id ?? null),
      loading: false
    };
  }

  closeQueueModal(): void {
    this.queueModal = { open: false, article: null, selectedProviderId: null, loading: false };
  }

  confirmQueue(): void {
    if (!this.queueModal.article || !this.queueModal.selectedProviderId) return;
    this.queueModal.loading = true;
    const article = this.queueModal.article;
    this.api.patch<ScrapedArticle>(`/admin/scraped-articles/${article.id}/queue`, {
      aiProviderId: this.queueModal.selectedProviderId
    }).subscribe({
      next: (updated) => {
        const idx = this.articles.findIndex(a => a.id === article.id);
        if (idx !== -1) this.articles[idx] = updated;
        this.closeQueueModal();
      },
      error: () => { this.queueModal.loading = false; }
    });
  }

  reject(article: ScrapedArticle): void {
    this.pendingId = article.id;
    this.api.patch<ScrapedArticle>(`/admin/scraped-articles/${article.id}/reject`, {}).subscribe({
      next: (updated) => {
        const idx = this.articles.findIndex(a => a.id === article.id);
        if (idx !== -1) this.articles[idx] = updated;
        this.pendingId = null;
      },
      error: () => { this.pendingId = null; }
    });
  }

  statusLabel(s: ApprovalStatus): string {
    return { PENDING: 'Pendente', APPROVED: 'Aprovado', QUEUED: 'Na Fila', REJECTED: 'Rejeitado' }[s] ?? s;
  }

  statusClass(s: ApprovalStatus): string {
    return { PENDING: 'chip-pending', APPROVED: 'chip-approved', QUEUED: 'chip-queued', REJECTED: 'chip-rejected' }[s] ?? '';
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
  }

  private loadTopics(): void {
    this.api.get<Topic[]>('/topics').subscribe({
      next: (topics) => { this.topics = topics; },
      error: () => {}
    });
  }

  private loadSources(topicId: number): void {
    if (this.sourcesMap[topicId]) return;
    this.loadingSources = true;
    this.api.get<SourceSite[]>(`/admin/topics/${topicId}/sources`).subscribe({
      next: (sources) => {
        this.sourcesMap = { ...this.sourcesMap, [topicId]: sources };
        this.loadingSources = false;
      },
      error: () => { this.loadingSources = false; }
    });
  }

  private loadProviders(): void {
    this.loadingProviders = true;
    this.api.get<AiProvider[]>('/admin/ai-providers').subscribe({
      next: (providers) => {
        this.providers = providers;
        this.loadingProviders = false;
      },
      error: () => { this.loadingProviders = false; }
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
    if (this.selectedSourceId) {
      params['sourceSiteId'] = String(this.selectedSourceId);
    } else if (this.selectedTopicId) {
      params['topicId'] = String(this.selectedTopicId);
    }

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
