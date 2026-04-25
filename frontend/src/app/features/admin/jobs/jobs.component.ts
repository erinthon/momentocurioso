import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

type JobStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
type TriggerSource = 'SCHEDULER' | 'MANUAL';

interface Job {
  id: number;
  topicSlug: string;
  status: JobStatus;
  triggeredBy: TriggerSource;
  startedAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
  postId: number | null;
}

@Component({
  selector: 'app-admin-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--ink); }

    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: rgba(11,11,18,.94); backdrop-filter: blur(18px);
      border-bottom: 1px solid var(--border);
      padding: 0 2rem; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .wordmark { display: flex; flex-direction: column; line-height: 1; }
    .wordmark-momento { font-family: var(--font-display); font-weight: 400; font-size: 9px; letter-spacing: .18em; color: var(--bright); text-transform: uppercase; }
    .wordmark-curioso { font-family: var(--font-display); font-weight: 800; font-size: 18px; color: var(--gold); letter-spacing: -.5px; line-height: 1.1; }
    .wordmark-tagline { font-family: var(--font-mono); font-size: 7px; color: var(--mid); letter-spacing: .14em; margin-top: 1px; }
    .nav-right { display: flex; align-items: center; gap: 24px; }
    .nav-link {
      font-family: var(--font-mono); font-size: 11px; letter-spacing: .06em;
      color: var(--mid); text-transform: uppercase; text-decoration: none;
      transition: color var(--transition-fast); padding-bottom: 2px;
      border-bottom: 2px solid transparent;
      &:hover { color: var(--bright); }
      &.active { color: var(--gold); border-bottom-color: var(--gold); }
    }
    .nav-logout {
      font-family: var(--font-mono); font-size: 11px; letter-spacing: .06em;
      color: var(--dim); text-transform: uppercase; background: none; border: none;
      cursor: pointer; transition: color var(--transition-fast);
      &:hover { color: var(--coral); }
    }

    .admin-header {
      padding: 40px 2rem 32px; border-bottom: 1px solid var(--border);
      display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px;
    }
    .admin-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: .2em; color: var(--gold); text-transform: uppercase; margin-bottom: 8px; }
    .admin-title { font-family: var(--font-display); font-weight: 800; font-size: 36px; color: var(--bright); letter-spacing: -1.5px; }

    .filter-tabs { display: flex; gap: 0; border: 1px solid var(--border); }
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
      background: var(--ink-2); padding: 1px 5px; border-radius: 2px; margin-left: 4px;
    }
    .tab-btn.active .tab-count { color: var(--gold); background: rgba(245,197,24,.12); }

    .content { padding: 32px 2rem 80px; max-width: 1200px; margin: 0 auto; }

    .results-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .sep-gold { width: 34px; height: 2px; background: var(--gold); display: block; flex-shrink: 0; }
    .results-label { font-family: var(--font-mono); font-size: 10px; color: var(--mid); letter-spacing: .12em; text-transform: uppercase; }

    .jobs-list { display: flex; flex-direction: column; gap: 1px; }

    .job-row {
      display: grid;
      grid-template-columns: 120px 100px 100px 1fr 140px 100px;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--ink-1);
      border: 1px solid var(--border);
      border-left: 3px solid transparent;
      transition: border-color var(--transition-fast), background var(--transition-fast);
      &:hover { background: var(--ink-2); }
      &.status-done { border-left-color: var(--gold); }
      &.status-failed { border-left-color: var(--coral); }
      &.status-running { border-left-color: var(--bright); }
    }
    @media (max-width: 900px) {
      .job-row { grid-template-columns: 1fr 1fr; }
    }

    .job-id {
      font-family: var(--font-mono); font-size: 10px; color: var(--dim);
      letter-spacing: .1em;
    }
    .job-topic {
      font-family: var(--font-mono); font-size: 11px; color: var(--mid);
      letter-spacing: .08em; text-transform: uppercase;
    }
    .job-trigger {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .1em;
      text-transform: uppercase; padding: 3px 8px; border-radius: var(--radius-tag);
    }
    .trigger-manual { background: rgba(245,197,24,.1); color: var(--gold); border: 1px solid rgba(245,197,24,.25); }
    .trigger-scheduler { background: var(--ink-3); color: var(--mid); border: 1px solid var(--border); }

    .status-badge {
      font-family: var(--font-mono); font-size: 9px; letter-spacing: .12em;
      text-transform: uppercase; padding: 3px 8px; border-radius: var(--radius-tag);
      display: inline-flex; align-items: center; gap: 6px;
    }
    .badge-pending { background: var(--ink-3); color: var(--dim); border: 1px solid var(--border); }
    .badge-running { background: rgba(230,226,221,.08); color: var(--bright); border: 1px solid rgba(230,226,221,.2); }
    .badge-done { background: rgba(245,197,24,.12); color: var(--gold); border: 1px solid rgba(245,197,24,.3); }
    .badge-failed { background: rgba(255,77,46,.1); color: var(--coral); border: 1px solid rgba(255,77,46,.25); }
    .running-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--bright);
      animation: blink 1s ease-in-out infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

    .job-duration {
      font-family: var(--font-mono); font-size: 10px; color: var(--dim);
      letter-spacing: .08em;
    }
    .job-error {
      font-family: var(--font-mono); font-size: 10px; color: var(--coral);
      letter-spacing: .04em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .job-times {
      display: flex; flex-direction: column; gap: 2px;
    }
    .time-line { font-family: var(--font-mono); font-size: 10px; color: var(--dim); letter-spacing: .08em; }
    .time-label { color: var(--dim); margin-right: 4px; }

    .job-action {}
    .btn-view-post {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .08em;
      text-transform: uppercase; background: none; color: var(--gold);
      border: 1px solid rgba(245,197,24,.3); padding: 4px 10px;
      text-decoration: none; display: inline-block;
      transition: background var(--transition-fast);
      &:hover { background: rgba(245,197,24,.1); }
    }

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

    .table-header {
      display: grid;
      grid-template-columns: 120px 100px 100px 1fr 140px 100px;
      gap: 16px; padding: 10px 16px;
      margin-bottom: 2px;
    }
    .th {
      font-family: var(--font-mono); font-size: 9px; letter-spacing: .16em;
      color: var(--dim); text-transform: uppercase;
    }
    @media (max-width: 900px) {
      .table-header { display: none; }
    }
  `],
  template: `
    <nav class="navbar">
      <a class="logo" routerLink="/blog/posts">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="15" cy="15" r="10" stroke="#f5c518" stroke-width="2.2"/>
          <line x1="22.5" y1="22.5" x2="32" y2="32" stroke="#f5c518" stroke-width="2.2" stroke-linecap="round"/>
          <text x="11.5" y="20" font-family="Syne" font-weight="800" font-size="12" fill="#f5c518">?</text>
        </svg>
        <div class="wordmark">
          <span class="wordmark-momento">Momento</span>
          <span class="wordmark-curioso">CURIOSO</span>
          <span class="wordmark-tagline">Admin</span>
        </div>
      </a>
      <div class="nav-right">
        <a class="nav-link" routerLink="/admin/topics">Tópicos</a>
        <a class="nav-link" routerLink="/admin/posts">Posts</a>
        <a class="nav-link active" routerLink="/admin/jobs">Jobs</a>
        <a class="nav-link" routerLink="/admin/trigger">Trigger</a>
        <button class="nav-logout" (click)="logout()">Sair</button>
      </div>
    </nav>

    <div class="admin-header">
      <div>
        <p class="admin-label">Admin · Monitoramento</p>
        <h1 class="admin-title">Jobs de Geração</h1>
      </div>
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="activeFilter === 'ALL'" (click)="setFilter('ALL')">
          Todos <span class="tab-count">{{ jobs.length }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'DONE'" (click)="setFilter('DONE')">
          Done <span class="tab-count">{{ countBy('DONE') }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'FAILED'" (click)="setFilter('FAILED')">
          Failed <span class="tab-count">{{ countBy('FAILED') }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'RUNNING'" (click)="setFilter('RUNNING')">
          Running <span class="tab-count">{{ countBy('RUNNING') }}</span>
        </button>
      </div>
    </div>

    <div class="content">
      <div *ngIf="loading" class="state-loading">
        <span class="pulse"></span>
        <p>Carregando jobs...</p>
      </div>

      <ng-container *ngIf="!loading">
        <div class="results-bar">
          <span class="sep-gold"></span>
          <span class="results-label">{{ filtered.length }} {{ filtered.length === 1 ? 'job' : 'jobs' }}</span>
        </div>

        <div *ngIf="filtered.length === 0" class="state-empty">
          <span class="sep-gold"></span>
          <p>Nenhum job encontrado</p>
        </div>

        <ng-container *ngIf="filtered.length > 0">
          <div class="table-header">
            <span class="th">ID</span>
            <span class="th">Tópico</span>
            <span class="th">Origem</span>
            <span class="th">Status / Erro</span>
            <span class="th">Horários</span>
            <span class="th">Post</span>
          </div>
          <div class="jobs-list">
            <div
              *ngFor="let j of filtered"
              class="job-row"
              [class.status-done]="j.status === 'DONE'"
              [class.status-failed]="j.status === 'FAILED'"
              [class.status-running]="j.status === 'RUNNING'">

              <span class="job-id">#{{ j.id }}</span>

              <span class="job-topic">{{ j.topicSlug }}</span>

              <span class="job-trigger"
                [class.trigger-manual]="j.triggeredBy === 'MANUAL'"
                [class.trigger-scheduler]="j.triggeredBy === 'SCHEDULER'">
                {{ j.triggeredBy === 'MANUAL' ? 'Manual' : 'Auto' }}
              </span>

              <div>
                <span class="status-badge"
                  [class.badge-pending]="j.status === 'PENDING'"
                  [class.badge-running]="j.status === 'RUNNING'"
                  [class.badge-done]="j.status === 'DONE'"
                  [class.badge-failed]="j.status === 'FAILED'">
                  <span *ngIf="j.status === 'RUNNING'" class="running-dot"></span>
                  {{ statusLabel(j.status) }}
                </span>
                <div class="job-error" *ngIf="j.errorMessage" [title]="j.errorMessage">
                  {{ j.errorMessage }}
                </div>
              </div>

              <div class="job-times">
                <span class="time-line">
                  <span class="time-label">início</span>{{ formatTime(j.startedAt) }}
                </span>
                <span class="time-line" *ngIf="j.finishedAt">
                  <span class="time-label">fim</span>{{ formatTime(j.finishedAt) }}
                </span>
                <span class="time-line" *ngIf="j.finishedAt && j.startedAt">
                  <span class="time-label">dur.</span>{{ duration(j.startedAt, j.finishedAt) }}
                </span>
              </div>

              <div class="job-action">
                <a
                  *ngIf="j.postId && j.status === 'DONE'"
                  class="btn-view-post"
                  routerLink="/admin/posts">
                  Ver post →
                </a>
              </div>
            </div>
          </div>
        </ng-container>
      </ng-container>
    </div>
  `
})
export class AdminJobsComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  jobs: Job[] = [];
  filtered: Job[] = [];
  activeFilter: 'ALL' | JobStatus = 'ALL';
  loading = true;

  ngOnInit(): void {
    this.api.get<Job[]>('/admin/jobs').subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  setFilter(f: 'ALL' | JobStatus): void {
    this.activeFilter = f;
    this.applyFilter();
  }

  countBy(status: JobStatus): number {
    return this.jobs.filter(j => j.status === status).length;
  }

  statusLabel(s: JobStatus): string {
    return { PENDING: 'Pendente', RUNNING: 'Executando', DONE: 'Concluído', FAILED: 'Falhou' }[s];
  }

  formatTime(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  duration(start: string, end: string): string {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  private applyFilter(): void {
    this.filtered = this.activeFilter === 'ALL'
      ? this.jobs
      : this.jobs.filter(j => j.status === this.activeFilter);
  }
}
