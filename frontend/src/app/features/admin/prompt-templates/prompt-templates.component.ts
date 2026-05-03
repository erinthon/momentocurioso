import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';
import { PromptTemplate, PromptTemplateService } from '../../../core/services/prompt-template.service';

@Component({
  selector: 'app-admin-prompt-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--bg); }

    .page { max-width: 900px; margin: 0 auto; padding: 2.5rem 2rem; }

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

    /* ── Template Cards ──────────────────────────── */
    .cards-list { display: flex; flex-direction: column; gap: 12px; }

    .card {
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); padding: 1.25rem 1.5rem;
      transition: border-color var(--t);
      &.card-default {
        border-left: 3px solid var(--green);
        padding-left: calc(1.5rem - 2px);
      }
      &:hover { border-color: var(--border-2); }
    }

    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: .75rem;
    }
    .card-title {
      display: flex; align-items: center; gap: 10px;
    }
    .card-name {
      font-family: var(--fd); font-weight: 700; font-size: 15px; color: var(--text);
    }
    .card-meta {
      font-family: var(--fu); font-size: 11px; color: var(--text-4);
      margin-top: 2px;
    }
    .card-actions { display: flex; gap: 8px; align-items: center; }

    .card-preview {
      font-family: monospace; font-size: 12px; line-height: 1.6;
      color: var(--text-3); background: var(--bg-2);
      border: 1px solid var(--border); border-radius: calc(var(--r) - 2px);
      padding: .75rem 1rem;
      white-space: pre-wrap; word-break: break-word;
      max-height: 110px; overflow: hidden;
      position: relative;
      &::after {
        content: ''; position: absolute; bottom: 0; left: 0; right: 0;
        height: 40px;
        background: linear-gradient(transparent, var(--bg-2));
      }
    }

    /* ── Buttons ─────────────────────────────────── */
    .btn-default {
      padding: 5px 12px; background: none; border: 1px solid var(--green);
      border-radius: var(--r); font-family: var(--fu); font-size: 12px;
      font-weight: 600; color: var(--green); cursor: pointer; transition: all var(--t);
      white-space: nowrap;
      &:hover:not(:disabled) { background: var(--green); color: #fff; }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }
    .btn-edit {
      padding: 5px 12px; background: none; border: 1px solid var(--border);
      border-radius: var(--r); font-family: var(--fu); font-size: 12px;
      color: var(--text-2); cursor: pointer; transition: all var(--t);
      &:hover:not(:disabled) { border-color: var(--border-2); color: var(--text); }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }
    .btn-delete {
      padding: 5px 12px; background: none; border: 1px solid var(--border);
      border-radius: var(--r); font-family: var(--fu); font-size: 12px;
      color: var(--text-3); cursor: pointer; transition: all var(--t);
      &:hover:not(:disabled) { border-color: var(--coral); color: var(--coral); }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }

    /* ── States ──────────────────────────────────── */
    .state-empty {
      padding: 3rem 1rem; text-align: center;
      background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--r);
      font-family: var(--fu); font-size: 13px; color: var(--text-3);
    }
    .pulse-bar {
      height: 72px; background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); margin-bottom: 12px;
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }

    .error-banner {
      padding: 10px 14px; background: color-mix(in srgb, var(--coral) 10%, transparent);
      border: 1px solid var(--coral); border-radius: var(--r);
      font-family: var(--fu); font-size: 13px; color: var(--coral);
      margin-bottom: 1rem;
    }

    /* ── Modal Overlay ───────────────────────────── */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,.45); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem;
    }
    .modal {
      background: var(--bg); border: 1px solid var(--border);
      border-radius: var(--r); padding: 1.75rem 2rem;
      width: 100%; max-width: 640px;
      max-height: 90vh; overflow-y: auto;
    }
    .modal-title {
      font-family: var(--fd); font-weight: 800; font-size: 20px;
      color: var(--text); margin: 0 0 1.5rem;
    }
    .modal-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 1rem; }
    .modal-label {
      font-family: var(--fu); font-size: 11px; font-weight: 600;
      letter-spacing: .08em; text-transform: uppercase; color: var(--text-3);
    }
    .modal-input {
      padding: 8px 12px; background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); font-family: var(--fu); font-size: 13px;
      color: var(--text); outline: none; transition: border-color var(--t);
      &:focus { border-color: var(--green); }
    }
    .modal-textarea {
      padding: 10px 12px; background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); font-family: monospace; font-size: 13px; line-height: 1.6;
      color: var(--text); outline: none; resize: vertical; min-height: 220px;
      transition: border-color var(--t);
      &:focus { border-color: var(--green); }
    }
    .vars-guide {
      background: var(--bg-2); border: 1px solid var(--border);
      border-radius: calc(var(--r) - 2px); padding: .75rem 1rem;
      margin-bottom: 1.25rem;
    }
    .vars-title {
      font-family: var(--fu); font-size: 11px; font-weight: 600;
      letter-spacing: .08em; text-transform: uppercase;
      color: var(--text-3); margin: 0 0 .5rem;
    }
    .vars-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .var-chip {
      font-family: monospace; font-size: 12px;
      padding: 3px 8px; background: var(--bg); border: 1px solid var(--border);
      border-radius: 4px; color: var(--green); font-weight: 600;
    }
    .var-desc { font-family: var(--fu); font-size: 11px; color: var(--text-4); }
    .var-item { display: flex; align-items: center; gap: 6px; }

    .modal-actions { display: flex; gap: 10px; align-items: center; margin-top: 4px; }
    .btn-save {
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
    .modal-error { font-family: var(--fu); font-size: 12px; color: var(--coral); }
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
          <h1 class="admin-title">Prompt Templates</h1>
        </div>
        <button class="btn-new" (click)="openModal()">+ Novo Template</button>
      </div>

      @if (loadError) {
        <div class="error-banner">{{ loadError }}</div>
      }

      <!-- Loading -->
      @if (loading) {
        <div class="pulse-bar"></div>
        <div class="pulse-bar" style="opacity: .6; height: 56px"></div>
      } @else if (templates.length === 0) {
        <div class="state-empty">
          Nenhum template cadastrado. Crie o primeiro usando "+ Novo Template".
        </div>
      } @else {
        <div class="cards-list">
          @for (t of templates; track t.id) {
            <div class="card" [class.card-default]="t.isDefault">
              <div class="card-header">
                <div class="card-title">
                  <span class="card-name">{{ t.name }}</span>
                  @if (t.isDefault) {
                    <span class="tag tag-green">Padrão</span>
                  }
                </div>
                <div class="card-actions">
                  @if (!t.isDefault) {
                    <button class="btn-default"
                            (click)="setDefault(t.id)"
                            [disabled]="actionId === t.id">
                      {{ actionId === t.id ? '…' : 'Definir Padrão' }}
                    </button>
                  }
                  <button class="btn-edit"
                          (click)="openModal(t)"
                          [disabled]="actionId === t.id">
                    Editar
                  </button>
                  @if (!t.isDefault) {
                    <button class="btn-delete"
                            (click)="confirmDelete(t)"
                            [disabled]="actionId === t.id">
                      {{ deleteTarget?.id === t.id ? 'Confirmar?' : 'Excluir' }}
                    </button>
                  }
                </div>
              </div>
              <div class="card-meta">Atualizado em {{ formatDate(t.updatedAt) }}</div>
              <div class="card-preview">{{ t.template }}</div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal criar / editar -->
    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2 class="modal-title">{{ editTarget ? 'Editar Template' : 'Novo Template' }}</h2>

          <div class="modal-field">
            <label class="modal-label">Nome</label>
            <input class="modal-input" [(ngModel)]="form.name"
                   placeholder="ex: Template PT-BR Curto" />
          </div>

          <div class="modal-field">
            <label class="modal-label">Template</label>
            <textarea class="modal-textarea"
                      [(ngModel)]="form.template"
                      placeholder="Escreva o prompt aqui usando {{topic_name}} e {{articles}}…">
            </textarea>
          </div>

          <div class="vars-guide">
            <p class="vars-title">Variáveis disponíveis</p>
            <div class="vars-list">
              <div class="var-item">
                <span class="var-chip">&#123;&#123;topic_name&#125;&#125;</span>
                <span class="var-desc">Nome do tópico</span>
              </div>
              <div class="var-item">
                <span class="var-chip">&#123;&#123;articles&#125;&#125;</span>
                <span class="var-desc">Artigos raspados formatados</span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-save" (click)="save()" [disabled]="saving">
              {{ saving ? 'Salvando…' : (editTarget ? 'Salvar Alterações' : 'Criar Template') }}
            </button>
            <button class="btn-cancel" (click)="closeModal()">Cancelar</button>
            @if (modalError) {
              <span class="modal-error">{{ modalError }}</span>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class AdminPromptTemplatesComponent implements OnInit {
  private svc = inject(PromptTemplateService);

  templates: PromptTemplate[] = [];
  loading = true;
  loadError = '';
  actionId: number | null = null;
  deleteTarget: PromptTemplate | null = null;

  showModal = false;
  editTarget: PromptTemplate | null = null;
  saving = false;
  modalError = '';
  form = { name: '', template: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = '';
    this.svc.findAll().subscribe({
      next: (data) => { this.templates = data; this.loading = false; },
      error: () => { this.loadError = 'Erro ao carregar templates.'; this.loading = false; }
    });
  }

  openModal(template?: PromptTemplate): void {
    this.editTarget = template ?? null;
    this.form = template
      ? { name: template.name, template: template.template }
      : { name: '', template: '' };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editTarget = null;
    this.modalError = '';
  }

  save(): void {
    if (!this.form.name.trim() || !this.form.template.trim()) {
      this.modalError = 'Nome e template são obrigatórios.';
      return;
    }
    this.saving = true;
    this.modalError = '';
    const body = { name: this.form.name.trim(), template: this.form.template.trim() };
    const req = this.editTarget
      ? this.svc.update(this.editTarget.id, body)
      : this.svc.create(body);
    req.subscribe({
      next: (saved) => {
        if (this.editTarget) {
          this.templates = this.templates.map(t => t.id === saved.id ? saved : t);
        } else {
          this.templates = [saved, ...this.templates];
        }
        this.saving = false;
        this.closeModal();
      },
      error: (err) => {
        this.modalError = err?.error?.message ?? 'Erro ao salvar template.';
        this.saving = false;
      }
    });
  }

  setDefault(id: number): void {
    this.actionId = id;
    this.svc.setDefault(id).subscribe({
      next: (updated) => {
        this.templates = this.templates.map(t => ({ ...t, isDefault: t.id === updated.id }));
        this.actionId = null;
      },
      error: () => { this.actionId = null; }
    });
  }

  confirmDelete(template: PromptTemplate): void {
    if (this.deleteTarget?.id === template.id) {
      this.actionId = template.id;
      this.svc.delete(template.id).subscribe({
        next: () => {
          this.templates = this.templates.filter(t => t.id !== template.id);
          this.actionId = null;
          this.deleteTarget = null;
        },
        error: () => { this.actionId = null; this.deleteTarget = null; }
      });
    } else {
      this.deleteTarget = template;
      setTimeout(() => {
        if (this.deleteTarget?.id === template.id) this.deleteTarget = null;
      }, 3000);
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
