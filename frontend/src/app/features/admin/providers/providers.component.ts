import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';

interface AiProvider {
  id: number;
  name: string;
  type: 'CLAUDE' | 'OPENAI' | 'OPENAI_COMPATIBLE';
  model: string;
  baseUrl: string | null;
  active: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin-providers',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--bg); }

    .page { max-width: 1100px; margin: 0 auto; padding: 2.5rem 2rem; }

    /* ── Header ─────────────────────────────────── */
    .admin-header {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 2rem;
    }
    .header-left { display: flex; flex-direction: column; gap: 6px; }
    .eyebrow-line { display: flex; align-items: center; gap: 10px; }
    .eyebrow-text { font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .18em; text-transform: uppercase; color: var(--text-3); }
    .sep-short { width: 32px; height: 2px; background: var(--green); border-radius: 2px; }
    .admin-title { font-family: var(--fd); font-weight: 800; font-size: 28px;
      color: var(--text); letter-spacing: -.5px; margin: 0; }

    .btn-new {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 18px; background: var(--green); color: #fff;
      border: none; border-radius: var(--r); font-family: var(--fu);
      font-size: 13px; font-weight: 600; cursor: pointer; transition: all var(--t);
      &:hover { background: var(--green-2); transform: translateY(-1px);
        box-shadow: 0 4px 12px color-mix(in srgb, var(--green) 30%, transparent); }
    }

    /* ── Create Form ─────────────────────────────── */
    .form-panel {
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); padding: 1.5rem; margin-bottom: 1.5rem;
    }
    .form-title { font-family: var(--fd); font-weight: 700; font-size: 15px;
      color: var(--text); margin: 0 0 1.25rem; }
    .form-grid {
      display: grid; grid-template-columns: 1fr 160px;
      gap: 12px;
    }
    .form-grid .full { grid-column: 1 / -1; }
    .form-field { display: flex; flex-direction: column; gap: 5px; }
    .form-label { font-family: var(--fu); font-size: 11px; font-weight: 600;
      letter-spacing: .08em; text-transform: uppercase; color: var(--text-3); }
    .form-input, .form-select {
      padding: 8px 12px; background: var(--bg); border: 1px solid var(--border);
      border-radius: var(--r); font-family: var(--fu); font-size: 13px; color: var(--text);
      transition: border-color var(--t); outline: none;
      &:focus { border-color: var(--green); }
    }
    .form-select { cursor: pointer; }
    .form-actions { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
    .btn-submit {
      padding: 8px 20px; background: var(--green); color: #fff;
      border: none; border-radius: var(--r); font-family: var(--fu);
      font-size: 13px; font-weight: 600; cursor: pointer; transition: all var(--t);
      &:hover:not(:disabled) { background: var(--green-2); }
      &:disabled { opacity: .6; cursor: not-allowed; }
    }
    .btn-cancel {
      padding: 8px 16px; background: none; border: 1px solid var(--border);
      border-radius: var(--r); font-family: var(--fu); font-size: 13px;
      color: var(--text-3); cursor: pointer; transition: all var(--t);
      &:hover { border-color: var(--border-2); color: var(--text); }
    }
    .form-error { font-family: var(--fu); font-size: 12px; color: var(--coral); margin-top: 2px; }

    /* ── Table ───────────────────────────────────── */
    .table-wrapper {
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); overflow: hidden;
    }
    .table-head, .table-row {
      display: grid;
      grid-template-columns: 1fr 110px 160px 160px 90px 190px;
      align-items: center;
    }
    .table-head {
      padding: 0 1rem; border-bottom: 1px solid var(--border);
    }
    .th {
      padding: 10px 8px; font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .1em; text-transform: uppercase; color: var(--text-3);
    }
    .table-row {
      padding: 0 1rem; border-bottom: 1px solid var(--border); min-height: 56px;
      transition: background var(--t);
      &:last-child { border-bottom: none; }
      &:hover { background: var(--bg-2); }
      &.active-row {
        border-left: 3px solid var(--green);
        background: color-mix(in srgb, var(--green) 5%, var(--bg-1));
        padding-left: calc(1rem - 3px);
      }
    }
    .td { padding: 8px; font-family: var(--fu); font-size: 13px; color: var(--text-2); }
    .td-name { font-weight: 600; color: var(--text); }
    .td-mono { font-family: monospace; font-size: 12px; color: var(--text-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .td-actions { display: flex; gap: 8px; align-items: center; }

    .btn-activate {
      padding: 5px 12px; background: none; border: 1px solid var(--green);
      border-radius: var(--r); font-family: var(--fu); font-size: 12px;
      font-weight: 600; color: var(--green); cursor: pointer; transition: all var(--t);
      white-space: nowrap;
      &:hover:not(:disabled) { background: var(--green); color: #fff; }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }
    .btn-remove {
      padding: 5px 12px; background: none; border: 1px solid var(--border);
      border-radius: var(--r); font-family: var(--fu); font-size: 12px;
      color: var(--text-3); cursor: pointer; transition: all var(--t);
      white-space: nowrap;
      &:hover:not(:disabled) { border-color: var(--coral); color: var(--coral); }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }

    /* ── States ──────────────────────────────────── */
    .state-empty {
      padding: 3rem 1rem; text-align: center;
      font-family: var(--fu); font-size: 13px; color: var(--text-3);
    }
    .pulse-bar {
      height: 16px; background: var(--bg-2); border-radius: 4px; margin: 14px 1rem;
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }

    @media (max-width: 900px) {
      .table-head { display: none; }
      .table-row { grid-template-columns: 1fr; gap: 4px; padding: 12px 1rem; }
      .td-actions { flex-wrap: wrap; }
    }
  `],
  template: `
    <app-admin-navbar />

    <div class="page">
      <!-- Header -->
      <div class="admin-header">
        <div class="header-left">
          <div class="eyebrow-line">
            <span class="eyebrow-text">Admin · IA</span>
            <div class="sep-short"></div>
          </div>
          <h1 class="admin-title">Providers</h1>
        </div>
        <button class="btn-new" (click)="toggleForm()">
          {{ showForm ? '✕ Cancelar' : '+ Novo Provider' }}
        </button>
      </div>

      <!-- Create Form -->
      @if (showForm) {
        <div class="form-panel">
          <p class="form-title">Novo Provider de IA</p>
          <div class="form-grid">
            <div class="form-field">
              <label class="form-label">Nome</label>
              <input class="form-input" [(ngModel)]="form.name"
                     placeholder="ex: Claude Sonnet" />
            </div>
            <div class="form-field">
              <label class="form-label">Tipo</label>
              <select class="form-select" [(ngModel)]="form.type">
                <option value="CLAUDE">Claude (Anthropic)</option>
                <option value="OPENAI">OpenAI</option>
                <option value="OPENAI_COMPATIBLE">OpenAI Compatible</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">API Key</label>
              <input class="form-input" [(ngModel)]="form.apiKey"
                     type="password" placeholder="sk-..." autocomplete="off" />
            </div>
            <div class="form-field">
              <label class="form-label">Modelo</label>
              <input class="form-input" [(ngModel)]="form.model"
                     placeholder="ex: claude-sonnet-4-6" />
            </div>
            @if (form.type === 'OPENAI_COMPATIBLE') {
              <div class="form-field full">
                <label class="form-label">Base URL</label>
                <input class="form-input" [(ngModel)]="form.baseUrl"
                       placeholder="https://api.meu-provider.com" />
              </div>
            }
          </div>
          <div class="form-actions" style="margin-top: 16px">
            <button class="btn-submit" (click)="create()" [disabled]="saving">
              {{ saving ? 'Criando…' : 'Criar Provider' }}
            </button>
            <button class="btn-cancel" (click)="toggleForm()">Cancelar</button>
            @if (formError) {
              <span class="form-error">{{ formError }}</span>
            }
          </div>
        </div>
      }

      <!-- Table -->
      <div class="table-wrapper">
        <div class="table-head">
          <span class="th">Nome</span>
          <span class="th">Tipo</span>
          <span class="th">Modelo</span>
          <span class="th">Base URL</span>
          <span class="th">Status</span>
          <span class="th">Ações</span>
        </div>

        @if (loading) {
          <div class="pulse-bar"></div>
          <div class="pulse-bar" style="width: 75%; opacity: .6"></div>
          <div class="pulse-bar" style="width: 50%; opacity: .4"></div>
        } @else if (providers.length === 0) {
          <div class="state-empty">
            Nenhum provider cadastrado. Crie o primeiro usando "+ Novo Provider".
          </div>
        } @else {
          @for (p of providers; track p.id) {
            <div class="table-row" [class.active-row]="p.active">
              <div class="td td-name">{{ p.name }}</div>
              <div class="td">
                <span class="tag" [ngClass]="typeBadge(p.type)">{{ typeLabel(p.type) }}</span>
              </div>
              <div class="td td-mono">{{ p.model }}</div>
              <div class="td td-mono">{{ p.baseUrl || '—' }}</div>
              <div class="td">
                <span class="tag" [ngClass]="p.active ? 'tag-green' : 'tag-ghost'">
                  {{ p.active ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
              <div class="td td-actions">
                @if (!p.active) {
                  <button class="btn-activate"
                          (click)="activate(p.id)"
                          [disabled]="activatingId === p.id || deletingId === p.id">
                    {{ activatingId === p.id ? '…' : 'Ativar' }}
                  </button>
                }
                <button class="btn-remove"
                        (click)="remove(p.id)"
                        [disabled]="deletingId === p.id || activatingId === p.id">
                  {{ deletingId === p.id ? '…' : 'Remover' }}
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class AdminProvidersComponent implements OnInit {
  private api = inject(ApiService);

  providers: AiProvider[] = [];
  loading = true;
  showForm = false;
  saving = false;
  activatingId: number | null = null;
  deletingId: number | null = null;
  formError = '';
  form = { name: '', type: 'CLAUDE', apiKey: '', baseUrl: '', model: '' };

  ngOnInit(): void {
    this.loadProviders();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.form = { name: '', type: 'CLAUDE', apiKey: '', baseUrl: '', model: '' };
      this.formError = '';
    }
  }

  loadProviders(): void {
    this.loading = true;
    this.api.get<AiProvider[]>('/admin/ai-providers').subscribe({
      next: (data) => { this.providers = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  create(): void {
    const { name, type, apiKey, baseUrl, model } = this.form;
    if (!name.trim() || !apiKey.trim() || !model.trim()) {
      this.formError = 'Nome, API Key e Modelo são obrigatórios.';
      return;
    }
    if (type === 'OPENAI_COMPATIBLE' && !baseUrl.trim()) {
      this.formError = 'Base URL é obrigatória para providers compatíveis com OpenAI.';
      return;
    }
    this.saving = true;
    this.formError = '';
    const body: Record<string, string> = { name: name.trim(), type, apiKey: apiKey.trim(), model: model.trim() };
    if (baseUrl.trim()) body['baseUrl'] = baseUrl.trim();
    this.api.post<AiProvider>('/admin/ai-providers', body).subscribe({
      next: (created) => {
        this.providers = [created, ...this.providers];
        this.saving = false;
        this.toggleForm();
      },
      error: (err) => {
        this.formError = err?.error?.message ?? 'Erro ao criar provider.';
        this.saving = false;
      }
    });
  }

  activate(id: number): void {
    this.activatingId = id;
    this.api.patch<AiProvider>(`/admin/ai-providers/${id}/activate`, {}).subscribe({
      next: () => {
        this.providers = this.providers.map(p => ({ ...p, active: p.id === id }));
        this.activatingId = null;
      },
      error: () => { this.activatingId = null; }
    });
  }

  remove(id: number): void {
    this.deletingId = id;
    this.api.delete<void>(`/admin/ai-providers/${id}`).subscribe({
      next: () => {
        this.providers = this.providers.filter(p => p.id !== id);
        this.deletingId = null;
      },
      error: () => { this.deletingId = null; }
    });
  }

  typeBadge(type: string): string {
    if (type === 'CLAUDE') return 'tag-green';
    if (type === 'OPENAI') return 'tag-pale';
    return 'tag-ghost';
  }

  typeLabel(type: string): string {
    if (type === 'CLAUDE') return 'Claude';
    if (type === 'OPENAI') return 'OpenAI';
    return 'Compatible';
  }
}
