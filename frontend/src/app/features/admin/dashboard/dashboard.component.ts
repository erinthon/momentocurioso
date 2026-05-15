import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';
import { DashboardService, DashboardMetrics } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminNavbarComponent],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--bg); }

    .admin-header {
      padding: 32px 2rem 24px;
      background: var(--bg-1);
      border-bottom: 1px solid var(--border);
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
    .admin-subtitle {
      font-family: var(--fu); font-size: 13px; color: var(--text-3); margin-top: 6px;
    }

    .content { padding: 32px 2rem; max-width: 1200px; }

    /* Pulse loading */
    .pulse-bar {
      height: 3px; background: var(--green);
      animation: pulse-width 1.4s ease-in-out infinite;
      border-radius: 2px;
    }
    @keyframes pulse-width {
      0%, 100% { width: 30%; opacity: .6; }
      50% { width: 80%; opacity: 1; }
    }

    .section-label {
      font-family: var(--fu); font-size: 10px; font-weight: 700;
      letter-spacing: .16em; text-transform: uppercase; color: var(--text-4);
      margin-bottom: 14px; margin-top: 32px;
    }
    .section-label:first-child { margin-top: 0; }

    /* Metric cards grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }
    .metric-card {
      background: var(--bg-1);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: 22px 24px;
      transition: border-color var(--t);
      &:hover { border-color: var(--green); }
    }
    .metric-value {
      font-family: var(--fd); font-weight: 800; font-size: 40px;
      color: var(--text); letter-spacing: -2px; line-height: 1;
    }
    .metric-value.green  { color: var(--green); }
    .metric-value.amber  { color: var(--amber); }
    .metric-value.coral  { color: var(--coral); }
    .metric-label {
      font-family: var(--fu); font-size: 11px; font-weight: 600;
      letter-spacing: .1em; text-transform: uppercase; color: var(--text-3);
      margin-top: 8px;
    }
    .metric-hint {
      font-family: var(--fu); font-size: 11px; color: var(--text-4); margin-top: 4px;
    }

    /* Detail cards */
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .detail-card {
      background: var(--bg-1);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: 22px 24px;
      border-left: 4px solid var(--border);
    }
    .detail-card.done    { border-left-color: var(--green); }
    .detail-card.running { border-left-color: var(--amber); }
    .detail-card.failed  { border-left-color: var(--coral); }
    .detail-card.pending { border-left-color: var(--text-4); }
    .detail-card.provider-card { border-left-color: var(--green); }
    .detail-card.no-data { border-left-color: var(--border); }

    .detail-card-title {
      font-family: var(--fu); font-size: 10px; font-weight: 700;
      letter-spacing: .16em; text-transform: uppercase; color: var(--text-4);
      margin-bottom: 14px;
    }
    .detail-main {
      font-family: var(--fd); font-weight: 800; font-size: 22px;
      color: var(--text); letter-spacing: -.5px; line-height: 1.2;
    }
    .detail-sub {
      font-family: var(--fu); font-size: 12px; color: var(--text-3); margin-top: 6px;
    }
    .detail-meta {
      font-family: var(--fu); font-size: 11px; color: var(--text-4); margin-top: 4px;
    }

    .status-chip {
      display: inline-block; padding: 3px 10px;
      border-radius: 20px; font-family: var(--fu); font-size: 10px;
      font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
      margin-top: 10px;
    }
    .chip-done    { background: color-mix(in srgb, var(--green) 15%, transparent); color: var(--green); }
    .chip-running { background: color-mix(in srgb, var(--amber) 15%, transparent); color: var(--amber); }
    .chip-failed  { background: color-mix(in srgb, var(--coral) 15%, transparent); color: var(--coral); }
    .chip-pending { background: var(--bg-2); color: var(--text-4); }

    .provider-type {
      display: inline-block; padding: 3px 10px;
      border-radius: 20px; font-family: var(--fu); font-size: 10px;
      font-weight: 700; letter-spacing: .08em;
      background: color-mix(in srgb, var(--green) 12%, transparent);
      color: var(--green); margin-top: 10px;
    }

    .no-data-text {
      font-family: var(--fu); font-size: 13px; color: var(--text-4); font-style: italic;
    }

    .error-box {
      background: color-mix(in srgb, var(--coral) 8%, transparent);
      border: 1px solid color-mix(in srgb, var(--coral) 30%, transparent);
      border-radius: var(--r); padding: 20px 24px;
      font-family: var(--fu); font-size: 13px; color: var(--coral);
    }

    .refresh-btn {
      font-family: var(--fu); font-size: 12px; font-weight: 600;
      color: var(--text-3); background: var(--bg-1);
      border: 1px solid var(--border); border-radius: var(--r);
      padding: 8px 18px; cursor: pointer; transition: all var(--t);
      margin-top: 16px;
      &:hover { border-color: var(--green); color: var(--green); }
    }
  `],
  template: `
    <app-admin-navbar />

    <div class="admin-header">
      <div>
        <div class="header-eyebrow">
          <span class="eyebrow-line"></span>
          <span class="eyebrow-text">Painel Administrativo</span>
        </div>
        <h1 class="admin-title">Dashboard</h1>
        <p class="admin-subtitle">Visão geral do sistema em tempo real</p>
      </div>
    </div>

    <div class="content">
      <div *ngIf="loading" class="pulse-bar" style="margin-bottom: 32px;"></div>

      <div *ngIf="error" class="error-box">
        Erro ao carregar métricas. Verifique a conexão com o backend.
        <br>
        <button class="refresh-btn" (click)="load()">Tentar novamente</button>
      </div>

      <ng-container *ngIf="metrics">
        <p class="section-label">Publicações</p>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value green">{{ metrics.postsToday }}</div>
            <div class="metric-label">Posts hoje</div>
            <div class="metric-hint">Gerados nas últimas 24h</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ metrics.totalPublishedPosts }}</div>
            <div class="metric-label">Publicados (total)</div>
            <div class="metric-hint">Posts visíveis no blog</div>
          </div>
          <div class="metric-card">
            <div class="metric-value" [class.amber]="metrics.pendingArticles > 0">{{ metrics.pendingArticles }}</div>
            <div class="metric-label">Artigos pendentes</div>
            <div class="metric-hint">Aguardando aprovação</div>
          </div>
          <div class="metric-card">
            <div class="metric-value" [class.coral]="metrics.queuedArticles > 0">{{ metrics.queuedArticles }}</div>
            <div class="metric-label">Na fila IA</div>
            <div class="metric-hint">Aguardando geração manual</div>
          </div>
        </div>

        <p class="section-label">Último Job & Provider</p>
        <div class="detail-grid">
          <!-- Último job -->
          <div class="detail-card"
               [class.done]="metrics.lastJob?.status === 'DONE'"
               [class.running]="metrics.lastJob?.status === 'RUNNING'"
               [class.failed]="metrics.lastJob?.status === 'FAILED'"
               [class.pending]="metrics.lastJob?.status === 'PENDING'"
               [class.no-data]="!metrics.lastJob">
            <div class="detail-card-title">Último Job</div>
            <ng-container *ngIf="metrics.lastJob; else noJob">
              <div class="detail-main">Tópico: {{ metrics.lastJob.topicSlug }}</div>
              <div class="detail-sub">{{ metrics.lastJob.startedAt | date:'dd/MM/yyyy HH:mm' }}</div>
              <div class="detail-meta" *ngIf="metrics.lastJob.articlesFound != null">
                {{ metrics.lastJob.articlesFound }} artigo(s) encontrado(s)
                <ng-container *ngIf="metrics.lastJob.articlesUsed != null">
                  · {{ metrics.lastJob.articlesUsed }} usado(s)
                </ng-container>
              </div>
              <div class="detail-meta" *ngIf="metrics.lastJob.errorMessage">
                ⚠ {{ metrics.lastJob.errorMessage }}
              </div>
              <span class="status-chip"
                    [class.chip-done]="metrics.lastJob.status === 'DONE'"
                    [class.chip-running]="metrics.lastJob.status === 'RUNNING'"
                    [class.chip-failed]="metrics.lastJob.status === 'FAILED'"
                    [class.chip-pending]="metrics.lastJob.status === 'PENDING'">
                {{ metrics.lastJob.status }}
              </span>
              <div style="margin-top: 12px;" *ngIf="metrics.lastJob.postId">
                <a [routerLink]="['/admin/posts']" style="font-family: var(--fu); font-size: 12px; color: var(--green);">
                  Ver posts →
                </a>
              </div>
            </ng-container>
            <ng-template #noJob>
              <div class="no-data-text">Nenhum job executado ainda.</div>
            </ng-template>
          </div>

          <!-- Provider ativo -->
          <div class="detail-card"
               [class.provider-card]="metrics.activeProvider"
               [class.no-data]="!metrics.activeProvider">
            <div class="detail-card-title">Provider Ativo</div>
            <ng-container *ngIf="metrics.activeProvider; else noProvider">
              <div class="detail-main">{{ metrics.activeProvider.name }}</div>
              <div class="detail-sub" *ngIf="metrics.activeProvider.model">
                Modelo: {{ metrics.activeProvider.model }}
              </div>
              <div class="detail-meta" *ngIf="metrics.activeProvider.baseUrl">
                {{ metrics.activeProvider.baseUrl }}
              </div>
              <span class="provider-type">{{ metrics.activeProvider.type }}</span>
              <div style="margin-top: 12px;">
                <a routerLink="/admin/providers" style="font-family: var(--fu); font-size: 12px; color: var(--green);">
                  Gerenciar providers →
                </a>
              </div>
            </ng-container>
            <ng-template #noProvider>
              <div class="no-data-text">Nenhum provider ativo.</div>
              <div style="margin-top: 12px;">
                <a routerLink="/admin/providers" style="font-family: var(--fu); font-size: 12px; color: var(--green);">
                  Configurar provider →
                </a>
              </div>
            </ng-template>
          </div>
        </div>

        <div style="margin-top: 24px;">
          <button class="refresh-btn" (click)="load()">↻ Atualizar</button>
        </div>
      </ng-container>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  metrics: DashboardMetrics | null = null;
  loading = false;
  error = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
}
