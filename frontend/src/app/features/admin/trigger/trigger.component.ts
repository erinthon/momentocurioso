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
      padding: 56px 2rem 100px;
    }

    .page-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: .2em; color: var(--gold); text-transform: uppercase; margin-bottom: 8px; }
    .page-title { font-family: var(--font-display); font-weight: 800; font-size: 42px; color: var(--bright); letter-spacing: -2px; line-height: 1.05; margin-bottom: 12px; }
    .page-title span { color: var(--gold); }
    .page-sub { font-family: var(--font-body); font-size: 15px; color: var(--mid); line-height: 1.6; margin-bottom: 48px; }

    .sep-gold { width: 34px; height: 2px; background: var(--gold); display: block; margin-bottom: 20px; }

    .section-label {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .18em;
      color: var(--mid); text-transform: uppercase; margin-bottom: 16px;
    }

    .topics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
      margin-bottom: 40px;
    }
    .topic-card {
      background: var(--ink-1);
      padding: 20px;
      cursor: pointer;
      transition: background var(--transition-base), border-color var(--transition-base);
      border: 2px solid transparent;
      margin: -1px;
      &:hover { background: var(--ink-2); }
      &.selected {
        background: var(--ink-2);
        border-color: var(--gold);
        z-index: 1;
      }
      &.inactive { opacity: .45; cursor: not-allowed; }
    }
    .card-check {
      width: 16px; height: 16px; border: 1.5px solid var(--border);
      border-radius: 2px; margin-bottom: 12px;
      display: flex; align-items: center; justify-content: center;
      transition: background var(--transition-fast), border-color var(--transition-fast);
    }
    .topic-card.selected .card-check {
      background: var(--gold); border-color: var(--gold);
    }
    .check-mark {
      font-size: 10px; color: var(--ink); font-weight: 800; line-height: 1;
    }
    .card-name {
      font-family: var(--font-display); font-weight: 800; font-size: 14px;
      color: var(--bright); letter-spacing: -.3px; margin-bottom: 4px;
    }
    .card-slug {
      font-family: var(--font-mono); font-size: 10px; color: var(--gold);
      letter-spacing: .1em;
    }
    .card-desc {
      font-family: var(--font-body); font-size: 12px; color: var(--mid);
      line-height: 1.4; margin-top: 8px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    .trigger-area { margin-bottom: 48px; }
    .btn-trigger {
      font-family: var(--font-display); font-weight: 800; font-size: 18px;
      letter-spacing: -.3px; text-transform: uppercase;
      background: var(--gold); color: var(--ink);
      border: none; padding: 18px 48px;
      cursor: pointer; width: 100%;
      transition: opacity var(--transition-fast), transform var(--transition-fast);
      &:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
      &:disabled { opacity: .35; cursor: not-allowed; transform: none; }
    }
    .trigger-hint {
      font-family: var(--font-mono); font-size: 10px; color: var(--dim);
      letter-spacing: .12em; text-align: center; margin-top: 12px;
      text-transform: uppercase;
    }

    .result-card {
      border: 1px solid var(--border);
      border-left: 3px solid var(--gold);
      background: var(--ink-1);
      padding: 28px;
      margin-top: 8px;
    }
    .result-card.result-failed { border-left-color: var(--coral); }
    .result-label {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .18em;
      color: var(--gold); text-transform: uppercase; margin-bottom: 16px;
    }
    .result-card.result-failed .result-label { color: var(--coral); }
    .result-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 16px;
    }
    .result-field label {
      font-family: var(--font-mono); font-size: 9px; letter-spacing: .14em;
      color: var(--dim); text-transform: uppercase; display: block; margin-bottom: 4px;
    }
    .result-field span {
      font-family: var(--font-mono); font-size: 12px; color: var(--mid);
      letter-spacing: .06em;
    }
    .result-field .val-gold { color: var(--gold); }
    .result-field .val-coral { color: var(--coral); }
    .result-error {
      font-family: var(--font-mono); font-size: 11px; color: var(--coral);
      letter-spacing: .04em; margin-top: 12px; padding-top: 12px;
      border-top: 1px solid var(--border);
    }
    .result-actions { margin-top: 16px; display: flex; gap: 12px; }
    .btn-result-link {
      font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em;
      text-transform: uppercase; color: var(--gold); text-decoration: none;
      border: 1px solid rgba(245,197,24,.3); padding: 6px 16px;
      transition: background var(--transition-fast);
      &:hover { background: rgba(245,197,24,.1); }
    }

    .state-loading {
      display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px 0;
    }
    .state-loading p { font-family: var(--font-mono); font-size: 11px; color: var(--dim); letter-spacing: .12em; text-transform: uppercase; }
    .pulse { display: block; width: 34px; height: 2px; background: var(--gold); animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{opacity:1;width:34px}50%{opacity:.3;width:60px} }

    @media (max-width: 600px) {
      .page { padding: 40px 1rem 80px; }
      .page-title { font-size: 32px; }
      .result-grid { grid-template-columns: 1fr 1fr; }
      .topics-grid { grid-template-columns: 1fr 1fr; }
    }
  `],
  template: `
    <app-admin-navbar />

    <div class="page">
      <p class="page-label">Admin · Geração Manual</p>
      <span class="sep-gold"></span>
      <h1 class="page-title">Disparar <span>geração</span><br/>de conteúdo</h1>
      <p class="page-sub">
        Selecione um tópico e dispare manualmente o pipeline de geração de posts por IA.
        O job é executado de forma síncrona — aguarde o resultado.
      </p>

      <!-- Topic selection -->
      <p class="section-label">1. Selecione o tópico</p>

      <div *ngIf="loadingTopics" class="state-loading">
        <span class="pulse"></span>
        <p>Carregando tópicos...</p>
      </div>

      <div class="topics-grid" *ngIf="!loadingTopics">
        <div
          *ngFor="let t of topics"
          class="topic-card"
          [class.selected]="selectedTopic?.id === t.id"
          [class.inactive]="!t.active"
          (click)="t.active && selectTopic(t)">
          <div class="card-check">
            <span class="check-mark" *ngIf="selectedTopic?.id === t.id">✓</span>
          </div>
          <div class="card-name">{{ t.name }}</div>
          <div class="card-slug">/{{ t.slug }}</div>
          <div class="card-desc" *ngIf="t.description">{{ t.description }}</div>
        </div>
      </div>

      <!-- Trigger button -->
      <div class="trigger-area">
        <p class="section-label">2. Disparar</p>
        <button
          class="btn-trigger"
          (click)="trigger()"
          [disabled]="!selectedTopic || running">
          {{ running ? 'Gerando conteúdo...' : 'Disparar Geração' }}
        </button>
        <p class="trigger-hint" *ngIf="!selectedTopic">Selecione um tópico acima para habilitar</p>
        <p class="trigger-hint" *ngIf="selectedTopic && !running">
          Tópico: {{ selectedTopic.name }} · Este processo pode levar alguns segundos
        </p>
      </div>

      <!-- Result -->
      <ng-container *ngIf="result">
        <p class="section-label">3. Resultado</p>
        <div class="result-card" [class.result-failed]="result.status === 'FAILED'">
          <p class="result-label">
            {{ result.status === 'FAILED' ? '✕ Job falhou' : '✓ Job disparado com sucesso' }}
          </p>
          <div class="result-grid">
            <div class="result-field">
              <label>Job ID</label>
              <span class="val-gold">#{{ result.id }}</span>
            </div>
            <div class="result-field">
              <label>Status</label>
              <span [class.val-gold]="result.status !== 'FAILED'" [class.val-coral]="result.status === 'FAILED'">
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
              <span class="val-gold">#{{ result.postId }}</span>
            </div>
          </div>
          <div class="result-error" *ngIf="result.errorMessage">
            Erro: {{ result.errorMessage }}
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
          postId: null
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
