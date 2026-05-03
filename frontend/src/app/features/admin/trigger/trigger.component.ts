import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';

interface Topic {
  id: number;
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

type JobStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

interface JobResult {
  id: number;
  topicSlug: string;
  status: JobStatus;
  triggeredBy: string;
  startedAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
  postId: number | null;
  articlesFound: number | null;
  articlesUsed: number | null;
  articlesSkipped: number | null;
  summary: string | null;
}

@Component({
  selector: 'app-admin-trigger',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminNavbarComponent],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--bg); }

    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 48px 2rem 100px;
    }

    .page-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .eyebrow-line { width: 24px; height: 2px; background: var(--green); flex-shrink: 0; }
    .eyebrow-text {
      font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .18em; text-transform: uppercase; color: var(--text-3);
    }
    .page-title {
      font-family: var(--fd); font-weight: 800; font-size: clamp(32px, 5vw, 48px);
      color: var(--text); letter-spacing: -2px; line-height: 1.05; margin-bottom: 12px;
    }
    .page-title em { font-style: normal; color: var(--green); }
    .page-sub {
      font-family: var(--fb); font-size: 16px; color: var(--text-3);
      line-height: 1.6; margin-bottom: 48px; max-width: 560px;
    }

    .section-eyebrow {
      display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
    }
    .section-num {
      font-family: var(--fu); font-size: 11px; font-weight: 700;
      color: var(--green); letter-spacing: .06em;
    }
    .section-label {
      font-family: var(--fu); font-size: 11px; font-weight: 600;
      color: var(--text-3); letter-spacing: .12em; text-transform: uppercase;
    }

    .topics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 40px;
    }
    .topic-card {
      background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--r);
      padding: 18px; cursor: pointer;
      transition: border-color var(--t), background var(--t), box-shadow var(--t);
      &:hover { border-color: var(--green); background: var(--bg-2); }
      &.selected {
        border-color: var(--green); background: var(--bg-2);
        box-shadow: 0 0 0 3px var(--green-pale);
      }
      &.inactive { opacity: .45; cursor: not-allowed; }
    }
    .card-check {
      width: 18px; height: 18px; border: 2px solid var(--border);
      border-radius: var(--r); margin-bottom: 12px;
      display: flex; align-items: center; justify-content: center;
      transition: background var(--t), border-color var(--t);
      font-size: 10px; font-weight: 800; color: transparent;
    }
    .topic-card.selected .card-check {
      background: var(--green); border-color: var(--green); color: #fff;
    }
    .card-name {
      font-family: var(--fd); font-weight: 700; font-size: 14px;
      color: var(--text); letter-spacing: -.3px; margin-bottom: 3px;
    }
    .card-slug {
      font-family: var(--fu); font-size: 10px; font-weight: 600;
      color: var(--green); letter-spacing: .08em;
    }
    .card-desc {
      font-family: var(--fb); font-size: 12px; color: var(--text-3);
      line-height: 1.4; margin-top: 8px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    .trigger-area { margin-bottom: 48px; }
    .btn-trigger {
      font-family: var(--fd); font-weight: 800; font-size: 18px;
      letter-spacing: -.4px; background: var(--green); color: #fff;
      border: none; padding: 18px 48px; border-radius: var(--r);
      cursor: pointer; width: 100%;
      transition: background var(--t), transform var(--t), box-shadow var(--t);
      &:hover:not(:disabled) {
        background: var(--green-2); transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(10,124,56,.3);
      }
      &:disabled { opacity: .35; cursor: not-allowed; transform: none; box-shadow: none; }
    }
    .trigger-hint {
      font-family: var(--fu); font-size: 11px; color: var(--text-4);
      letter-spacing: .08em; text-align: center; margin-top: 12px;
      text-transform: uppercase;
    }

    .result-card {
      background: var(--bg-1); border: 1px solid var(--border);
      border-left: 4px solid var(--green); border-radius: var(--rl);
      padding: 28px;
    }
    .result-card.result-failed { border-left-color: var(--coral); }
    .result-header {
      display: flex; align-items: center; gap: 10px; margin-bottom: 20px;
    }
    .result-status-label {
      font-family: var(--fu); font-size: 12px; font-weight: 700;
      letter-spacing: .08em; text-transform: uppercase;
    }
    .label-success { color: var(--green); }
    .label-failed { color: var(--coral); }
    .result-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px;
    }
    .result-field label {
      font-family: var(--fu); font-size: 10px; font-weight: 600; letter-spacing: .14em;
      color: var(--text-4); text-transform: uppercase; display: block; margin-bottom: 4px;
    }
    .result-field span {
      font-family: var(--fu); font-size: 13px; font-weight: 600; color: var(--text-2);
      letter-spacing: .04em;
    }
    .val-green { color: var(--green) !important; }
    .val-coral { color: var(--coral) !important; }
    .result-summary {
      font-family: var(--fu); font-size: 12px; color: var(--text-3);
      letter-spacing: .04em; margin-top: 4px; margin-bottom: 8px;
      padding: 10px 14px; background: var(--bg-2); border-radius: var(--r);
      border: 1px solid var(--border);
    }
    .result-error {
      font-family: var(--fb); font-size: 13px; color: var(--coral);
      margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);
      line-height: 1.5;
    }
    .result-actions { margin-top: 20px; display: flex; gap: 12px; }
    .btn-result-link {
      font-family: var(--fu); font-size: 12px; font-weight: 600; letter-spacing: .04em;
      color: var(--green); text-decoration: none;
      border: 1.5px solid var(--green); border-radius: var(--r); padding: 8px 18px;
      transition: background var(--t);
      &:hover { background: var(--green-pale); }
    }

    .state-loading {
      display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px 0;
    }
    .state-loading p {
      font-family: var(--fu); font-size: 12px; color: var(--text-4);
      letter-spacing: .1em; text-transform: uppercase;
    }
    .pulse-bar { width: 32px; height: 3px; background: var(--green); border-radius: 2px; animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{width:32px;opacity:1} 50%{width:56px;opacity:.4} }

    @media (max-width: 600px) {
      .page { padding: 32px 1rem 80px; }
      .result-grid { grid-template-columns: 1fr 1fr; }
      .topics-grid { grid-template-columns: 1fr 1fr; }
    }
  `],
  template: `
    <app-admin-navbar />

    <div class="page">
      <div class="page-eyebrow">
        <span class="eyebrow-line"></span>
        <span class="eyebrow-text">Admin · Geração Manual</span>
      </div>
      <h1 class="page-title">Disparar <em>geração</em><br/>de conteúdo</h1>
      <p class="page-sub">
        Selecione um tópico e dispare manualmente o pipeline de geração de posts por IA.
        O job é executado de forma síncrona — aguarde o resultado.
      </p>

      <div class="section-eyebrow">
        <span class="section-num">01</span>
        <span class="section-label">Selecione o tópico</span>
      </div>

      <div *ngIf="loadingTopics" class="state-loading">
        <span class="pulse-bar"></span>
        <p>Carregando tópicos...</p>
      </div>

      <div class="topics-grid" *ngIf="!loadingTopics">
        <div
          *ngFor="let t of topics"
          class="topic-card"
          [class.selected]="selectedTopic?.id === t.id"
          [class.inactive]="!t.active"
          (click)="t.active && selectTopic(t)">
          <div class="card-check">✓</div>
          <div class="card-name">{{ t.name }}</div>
          <div class="card-slug">/{{ t.slug }}</div>
          <div class="card-desc" *ngIf="t.description">{{ t.description }}</div>
        </div>
      </div>

      <div class="trigger-area">
        <div class="section-eyebrow">
          <span class="section-num">02</span>
          <span class="section-label">Disparar</span>
        </div>
        <button
          class="btn-trigger"
          (click)="trigger()"
          [disabled]="!selectedTopic || running">
          {{ running ? 'Gerando conteúdo...' : 'Disparar Geração' }}
        </button>
        <p class="trigger-hint" *ngIf="!selectedTopic">Selecione um tópico acima para habilitar</p>
        <p class="trigger-hint" *ngIf="selectedTopic && !running">
          Tópico selecionado: {{ selectedTopic.name }} · Processo pode levar alguns segundos
        </p>
      </div>

      <ng-container *ngIf="result">
        <div class="section-eyebrow">
          <span class="section-num">03</span>
          <span class="section-label">Resultado</span>
        </div>
        <div class="result-card" [class.result-failed]="result.status === 'FAILED'">
          <div class="result-header">
            <span class="tag" [class.tag-green]="result.status !== 'FAILED'" [class.tag-breaking]="result.status === 'FAILED'">
              {{ result.status === 'FAILED' ? 'Falhou' : 'Concluído' }}
            </span>
            <span class="result-status-label" [class.label-success]="result.status !== 'FAILED'" [class.label-failed]="result.status === 'FAILED'">
              {{ result.status === 'FAILED' ? 'Job falhou' : 'Job disparado com sucesso' }}
            </span>
          </div>
          <div class="result-grid">
            <div class="result-field">
              <label>Job ID</label>
              <span class="val-green">#{{ result.id }}</span>
            </div>
            <div class="result-field">
              <label>Status</label>
              <span [class.val-green]="result.status !== 'FAILED'" [class.val-coral]="result.status === 'FAILED'">
                {{ statusLabel(result.status) }}
              </span>
            </div>
            <div class="result-field">
              <label>Tópico</label>
              <span>{{ result.topicSlug }}</span>
            </div>
            <div class="result-field">
              <label>Iniciado</label>
              <span>{{ formatTime(result.startedAt) }}</span>
            </div>
            <div class="result-field" *ngIf="result.finishedAt">
              <label>Finalizado</label>
              <span>{{ formatTime(result.finishedAt) }}</span>
            </div>
            <div class="result-field" *ngIf="result.postId">
              <label>Post gerado</label>
              <span class="val-green">#{{ result.postId }}</span>
            </div>
            <div class="result-field" *ngIf="result.articlesFound !== null && result.articlesFound !== undefined">
              <label>Artigos encontrados</label>
              <span>{{ result.articlesFound }}</span>
            </div>
            <div class="result-field" *ngIf="result.articlesUsed !== null && result.articlesUsed !== undefined">
              <label>Artigos usados</label>
              <span>{{ result.articlesUsed }}</span>
            </div>
            <div class="result-field" *ngIf="result.articlesSkipped && result.articlesSkipped > 0">
              <label>Ignorados (duplicatas)</label>
              <span style="color: var(--amber)">{{ result.articlesSkipped }}</span>
            </div>
          </div>
          <div class="result-summary" *ngIf="result.summary">{{ result.summary }}</div>
          <div class="result-error" *ngIf="result.errorMessage">
            {{ result.errorMessage }}
          </div>
          <div class="result-actions">
            <a class="btn-result-link" routerLink="/admin/jobs">Ver todos os jobs →</a>
            <a class="btn-result-link" routerLink="/admin/posts" *ngIf="result.postId">
              Moderar post →
            </a>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class AdminTriggerComponent implements OnInit {
  private api = inject(ApiService);

  topics: Topic[] = [];
  selectedTopic: Topic | null = null;
  result: JobResult | null = null;
  loadingTopics = true;
  running = false;

  ngOnInit(): void {
    this.api.get<Topic[]>('/topics').subscribe({
      next: (topics) => {
        this.topics = topics;
        this.loadingTopics = false;
      },
      error: () => { this.loadingTopics = false; }
    });
  }

  selectTopic(topic: Topic): void {
    this.selectedTopic = topic;
    this.result = null;
  }

  trigger(): void {
    if (!this.selectedTopic) return;
    this.running = true;
    this.result = null;
    this.api.post<JobResult>('/admin/content/trigger', { topicId: this.selectedTopic.id }).subscribe({
      next: (job) => {
        this.result = job;
        this.running = false;
      },
      error: (err) => {
        this.result = {
          id: 0,
          topicSlug: this.selectedTopic!.slug,
          status: 'FAILED',
          triggeredBy: 'MANUAL',
          startedAt: new Date().toISOString(),
          finishedAt: null,
          errorMessage: err?.error?.message ?? 'Erro ao disparar o job.',
          postId: null,
          articlesFound: null,
          articlesUsed: null,
          articlesSkipped: null,
          summary: null
        };
        this.running = false;
      }
    });
  }

  statusLabel(s: JobStatus): string {
    return { PENDING: 'Pendente', RUNNING: 'Executando', DONE: 'Concluído', FAILED: 'Falhou' }[s];
  }

  formatTime(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}
