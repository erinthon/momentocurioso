import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';

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
    .tab-count { font-family: var(--fu); font-size: 10px; opacity: .7; margin-left: 4px; }

    .content { padding: 28px 2rem 80px; max-width: 1200px; margin: 0 auto; }

    .results-bar { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
    .results-label {
      font-family: var(--fu); font-size: 11px; font-weight: 600;
      color: var(--text-3); letter-spacing: .1em; text-transform: uppercase;
    }

    .table-header {
      display: grid;
      grid-template-columns: 80px 120px 90px 1fr 160px 100px;
      gap: 12px; padding: 10px 16px; margin-bottom: 4px;
    }
    .th {
      font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .14em; color: var(--text-4); text-transform: uppercase;
    }

    .jobs-list { display: flex; flex-direction: column; gap: 6px; }

    .job-row {
      display: grid;
      grid-template-columns: 80px 120px 90px 1fr 160px 100px;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: var(--bg-1);
      border: 1px solid var(--border);
      border-radius: var(--r);
      border-left: 3px solid transparent;
      transition: border-color var(--t), background var(--t);
      &:hover { background: var(--bg-2); }
      &.status-done { border-left-color: var(--green); }
      &.status-failed { border-left-color: var(--coral); }
      &.status-running { border-left-color: var(--amber); }
    }
    @media (max-width: 900px) {
      .table-header { display: none; }
      .job-row { grid-template-columns: 1fr 1fr; }
    }

    .job-id {
      font-family: var(--fu); font-size: 11px; font-weight: 600;
      color: var(--text-4); letter-spacing: .08em;
    }
    .job-topic {
      font-family: var(--fu); font-size: 11px; font-weight: 600;
      color: var(--text-2); letter-spacing: .04em;
    }

    .status-badge {
      display: inline-flex; align-items: center; gap: 6px;
    }
    .running-dot {
      width: 6px; height: 6px; border-radius: 50%; background: var(--amber);
      animation: blink 1s ease-in-out infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

    .job-times { display: flex; flex-direction: column; gap: 2px; }
    .time-line {
      font-family: var(--fu); font-size: 10px; color: var(--text-4); letter-spacing: .06em;
    }
    .time-label { color: var(--text-4); margin-right: 4px; font-weight: 600; }

    .job-error {
      font-family: var(--fu); font-size: 10px; color: var(--coral);
      letter-spacing: .02em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      margin-top: 4px;
    }

    .btn-view-post {
      font-family: var(--fu); font-size: 11px; font-weight: 600; letter-spacing: .04em;
      color: var(--green); border: 1.5px solid var(--green); border-radius: var(--r);
      padding: 5px 12px; text-decoration: none; display: inline-block;
      transition: background var(--t);
      &:hover { background: var(--green-pale); }
    }

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
          <span class="eyebrow-text">Admin · Monitoramento</span>
        </div>
        <h1 class="admin-title">Jobs de Geração</h1>
      </div>
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="activeFilter === 'ALL'" (click)="setFilter('ALL')">
          Todos <span class="tab-count">{{ jobs.length }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'DONE'" (click)="setFilter('DONE')">
          Concluídos <span class="tab-count">{{ countBy('DONE') }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'FAILED'" (click)="setFilter('FAILED')">
          Falhos <span class="tab-count">{{ countBy('FAILED') }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeFilter === 'RUNNING'" (click)="setFilter('RUNNING')">
          Executando <span class="tab-count">{{ countBy('RUNNING') }}</span>
        </button>
      </div>
    </div>

    <div class="content">
      <div *ngIf="loading" class="state-loading">
        <span class="pulse-bar"></span>
        <p>Carregando jobs...</p>
      </div>

      <ng-container *ngIf="!loading">
        <div class="results-bar">
          <span class="sep-short"></span>
          <span class="results-label">{{ filtered.length }} {{ filtered.length === 1 ? 'job' : 'jobs' }}</span>
        </div>

        <div *ngIf="filtered.length === 0" class="state-empty">
          <span class="sep-short"></span>
          <p>Nenhum job encontrado</p>
        </div>

        <ng-container *ngIf="filtered.length > 0">
          <div class="table-header">
            <span class="th">ID</span>
            <span class="th">Tópico</span>
            <span class="th">Origem</span>
            <span class="th">Status</span>
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

              <span class="tag"
                [class.tag-green]="j.triggeredBy === 'MANUAL'"
                [class.tag-ghost]="j.triggeredBy === 'SCHEDULER'">
                {{ j.triggeredBy === 'MANUAL' ? 'Manual' : 'Auto' }}
              </span>

              <div>
                <span class="status-badge tag"
                  [class.tag-ghost]="j.status === 'PENDING'"
                  [class.tag-amber]="j.status === 'RUNNING'"
                  [class.tag-green]="j.status === 'DONE'"
                  [class.tag-breaking]="j.status === 'FAILED'">
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

              <div>
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

  private applyFilter(): void {
    this.filtered = this.activeFilter === 'ALL'
      ? this.jobs
      : this.jobs.filter(j => j.status === this.activeFilter);
  }
}
