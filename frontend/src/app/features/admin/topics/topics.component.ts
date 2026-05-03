import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';

interface Topic {
  id: number;
  name: string;
  slug: string;
  description: string;
  autoPublish: boolean;
  active: boolean;
  requireApproval: boolean;
}

interface Source {
  id: number;
  topicId: number;
  url: string;
  type: 'RSS' | 'HTML';
  active: boolean;
}

@Component({
  selector: 'app-admin-topics',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
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

    .layout {
      display: grid;
      grid-template-columns: 380px 1fr;
      min-height: calc(100vh - 130px);
    }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .panel-right { border-left: none; border-top: 1px solid var(--border); }
    }

    .panel { padding: 24px; overflow-y: auto; }
    .panel-left { border-right: 1px solid var(--border); }
    .panel-right { background: var(--bg-1); }

    .panel-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;
    }
    .panel-title {
      font-family: var(--fd); font-weight: 700; font-size: 15px;
      color: var(--text); letter-spacing: -.3px;
    }
    .panel-count {
      font-family: var(--fu); font-size: 10px; color: var(--text-4);
      letter-spacing: .1em; margin-left: 6px;
    }
    .panel-topic-name {
      font-family: var(--fu); font-size: 11px; font-weight: 600;
      color: var(--green); margin-left: 6px;
    }

    .btn-new {
      font-family: var(--fu); font-size: 11px; font-weight: 600; letter-spacing: .04em;
      background: var(--bg-1); border: 1px solid var(--border); color: var(--text-3);
      padding: 6px 14px; border-radius: 40px; cursor: pointer; transition: all var(--t);
      &:hover { background: var(--green-pale); color: var(--green); border-color: var(--green); }
      &.open { background: var(--green); color: #fff; border-color: var(--green); }
    }
    .btn-submit {
      font-family: var(--fu); font-size: 13px; font-weight: 600;
      background: var(--green); color: #fff; border: none;
      padding: 9px 20px; border-radius: var(--r); cursor: pointer;
      transition: background var(--t), transform var(--t);
      &:hover:not(:disabled) { background: var(--green-2); transform: translateY(-1px); }
      &:disabled { opacity: .45; cursor: not-allowed; }
    }
    .btn-cancel {
      font-family: var(--fu); font-size: 13px; font-weight: 600;
      background: transparent; color: var(--text-3);
      border: 1px solid var(--border); padding: 9px 16px; border-radius: var(--r);
      cursor: pointer; transition: all var(--t);
      &:hover { border-color: var(--green); color: var(--green); }
    }
    .btn-delete {
      font-family: var(--fu); font-size: 11px; background: none;
      border: 1px solid transparent; color: var(--text-4);
      cursor: pointer; padding: 4px 8px; border-radius: var(--r);
      opacity: 0; transition: all var(--t); flex-shrink: 0;
      &:hover { color: var(--coral); border-color: rgba(220,38,38,.3); }
    }
    .source-item:hover .btn-delete { opacity: 1; }
    .source-item:hover .btn-icon { opacity: 1; }

    .btn-icon {
      font-size: 13px; background: none; border: 1px solid transparent;
      color: var(--text-4); cursor: pointer; padding: 4px 7px; border-radius: var(--r);
      opacity: 0; transition: all var(--t); flex-shrink: 0;
      &:hover { background: var(--bg-2); border-color: var(--border); color: var(--green); }
    }
    .btn-icon-danger { &:hover { color: var(--coral) !important; border-color: rgba(220,38,38,.3) !important; } }
    .topic-card:hover .btn-icon { opacity: 1; }

    .form-panel {
      background: var(--bg-2); border: 1px solid var(--border);
      border-radius: var(--r); padding: 20px; margin-bottom: 18px;
    }
    .form-title {
      font-family: var(--fu); font-size: 10px; font-weight: 600; letter-spacing: .14em;
      color: var(--green); text-transform: uppercase; margin-bottom: 16px;
    }
    .form-row { margin-bottom: 12px; }
    .form-row label {
      display: block; font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .12em; color: var(--text-3); text-transform: uppercase; margin-bottom: 5px;
    }
    .form-row input, .form-row select, .form-row textarea {
      width: 100%; box-sizing: border-box; background: var(--bg);
      border: 1px solid var(--border); border-radius: var(--r);
      color: var(--text); font-family: var(--fb); font-size: 14px;
      padding: 9px 12px; outline: none; transition: border-color var(--t);
      &:focus { border-color: var(--green); }
      &::placeholder { color: var(--text-4); }
    }
    .form-row textarea { resize: vertical; min-height: 64px; }
    .form-row select { cursor: pointer; }
    .form-check {
      display: flex; align-items: center; gap: 10px;
      font-family: var(--fb); font-size: 14px; color: var(--text-3); cursor: pointer;
    }
    .form-check input[type=checkbox] { accent-color: var(--green); width: 16px; height: 16px; cursor: pointer; }
    .form-actions { display: flex; gap: 10px; margin-top: 16px; }
    .form-error {
      font-family: var(--fu); font-size: 11px; color: var(--coral);
      letter-spacing: .04em; margin-top: 8px;
    }

    .topic-card {
      background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--r);
      padding: 16px 18px; margin-bottom: 8px; cursor: pointer;
      transition: border-color var(--t), background var(--t), box-shadow var(--t);
      &:hover { border-color: var(--green); background: var(--bg-2); }
      &.selected { border-color: var(--green); border-left: 3px solid var(--green); background: var(--bg-2); }
    }
    .topic-card-header {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
    }
    .topic-info { flex: 1; min-width: 0; }
    .topic-card-actions { display: flex; gap: 2px; flex-shrink: 0; }
    .topic-name {
      font-family: var(--fd); font-weight: 700; font-size: 14px;
      color: var(--text); letter-spacing: -.3px; margin-bottom: 2px;
    }
    .topic-slug {
      font-family: var(--fu); font-size: 10px; font-weight: 600;
      color: var(--green); letter-spacing: .08em; margin-bottom: 6px;
    }
    .topic-desc {
      font-family: var(--fb); font-size: 12px; color: var(--text-3);
      line-height: 1.5; margin-bottom: 8px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .topic-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

    .inline-edit-form {
      border-top: 1px solid var(--border); padding-top: 14px; margin-top: 10px;
    }
    .inline-form-row { margin-bottom: 10px; }
    .inline-form-row label {
      display: block; font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .12em; color: var(--text-3); text-transform: uppercase; margin-bottom: 4px;
    }
    .inline-form-row input, .inline-form-row textarea {
      width: 100%; box-sizing: border-box; background: var(--bg);
      border: 1px solid var(--border); border-radius: var(--r);
      color: var(--text); font-family: var(--fb); font-size: 13px;
      padding: 7px 10px; outline: none; transition: border-color var(--t);
      &:focus { border-color: var(--green); }
    }
    .inline-form-row textarea { resize: vertical; min-height: 52px; }
    .inline-form-check {
      display: flex; align-items: center; gap: 8px;
      font-family: var(--fu); font-size: 12px; color: var(--text-3); cursor: pointer;
    }
    .inline-form-check input[type=checkbox] { accent-color: var(--green); cursor: pointer; }
    .inline-form-actions { display: flex; gap: 8px; margin-top: 12px; }
    .btn-save-sm {
      font-family: var(--fu); font-size: 12px; font-weight: 600;
      background: var(--green); color: #fff; border: none;
      padding: 7px 14px; border-radius: var(--r); cursor: pointer;
      transition: background var(--t);
      &:hover:not(:disabled) { background: var(--green-2); }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }
    .btn-cancel-sm {
      font-family: var(--fu); font-size: 12px; font-weight: 600;
      background: none; color: var(--text-3);
      border: 1px solid var(--border); padding: 7px 12px; border-radius: var(--r);
      cursor: pointer; transition: all var(--t);
      &:hover { border-color: var(--border-2); color: var(--text); }
    }

    .source-item {
      display: flex; align-items: center; gap: 12px;
      background: var(--bg); border: 1px solid var(--border); border-radius: var(--r);
      padding: 11px 14px; margin-bottom: 8px; transition: border-color var(--t);
      &:hover { border-color: var(--border-2); }
    }
    .source-url {
      font-family: var(--fu); font-size: 11px; color: var(--text-3);
      letter-spacing: .02em; flex: 1; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap;
    }

    .source-edit-form {
      background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--r);
      padding: 14px; margin-bottom: 8px;
    }
    .source-edit-title {
      font-family: var(--fu); font-size: 10px; font-weight: 600; letter-spacing: .12em;
      color: var(--green); text-transform: uppercase; margin-bottom: 12px;
    }

    .state-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 14px; padding: 48px 0; text-align: center;
    }
    .state-empty p {
      font-family: var(--fu); font-size: 12px; color: var(--text-4);
      letter-spacing: .1em; text-transform: uppercase;
    }
    .panel-placeholder {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; gap: 14px; padding: 60px 2rem; text-align: center;
    }
    .placeholder-icon {
      font-family: var(--fd); font-weight: 800; font-size: 64px;
      color: var(--border-2); line-height: 1;
    }
    .placeholder-text {
      font-family: var(--fu); font-size: 12px; color: var(--text-4);
      letter-spacing: .12em; text-transform: uppercase; max-width: 240px; line-height: 1.5;
    }
    .pulse-bar { width: 32px; height: 3px; background: var(--green); border-radius: 2px; animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{width:32px;opacity:1} 50%{width:56px;opacity:.4} }
  `],
  template: `
    <app-admin-navbar />

    <div class="admin-header">
      <div class="header-eyebrow">
        <span class="eyebrow-line"></span>
        <span class="eyebrow-text">Admin · Gerenciamento</span>
      </div>
      <h1 class="admin-title">Tópicos &amp; Fontes</h1>
    </div>

    <div class="layout">
      <!-- LEFT: topics panel -->
      <div class="panel panel-left">
        <div class="panel-header">
          <div>
            <span class="panel-title">Tópicos</span>
            <span class="panel-count" *ngIf="!loadingTopics">{{ topics.length }}</span>
          </div>
          <button class="btn-new" [class.open]="showCreateTopic" (click)="toggleCreateTopic()">
            {{ showCreateTopic ? '— Cancelar' : '+ Novo' }}
          </button>
        </div>

        <div class="form-panel" *ngIf="showCreateTopic">
          <p class="form-title">Novo Tópico</p>
          <div class="form-row">
            <label>Nome *</label>
            <input [(ngModel)]="newTopic.name" placeholder="ex: Inteligência Artificial" (input)="autoSlug()"/>
          </div>
          <div class="form-row">
            <label>Slug *</label>
            <input [(ngModel)]="newTopic.slug" placeholder="ex: inteligencia-artificial"/>
          </div>
          <div class="form-row">
            <label>Descrição</label>
            <textarea [(ngModel)]="newTopic.description" placeholder="Breve descrição do tópico..."></textarea>
          </div>
          <div class="form-row">
            <label class="form-check">
              <input type="checkbox" [(ngModel)]="newTopic.autoPublish"/>
              Auto-publicar posts gerados
            </label>
          </div>
          <div class="form-row">
            <label class="form-check">
              <input type="checkbox" [(ngModel)]="newTopic.requireApproval"/>
              Exigir aprovação manual antes da IA
            </label>
          </div>
          <div class="form-actions">
            <button class="btn-submit" (click)="createTopic()" [disabled]="savingTopic">
              {{ savingTopic ? 'Salvando...' : 'Criar Tópico' }}
            </button>
            <button class="btn-cancel" (click)="toggleCreateTopic()">Cancelar</button>
          </div>
          <p class="form-error" *ngIf="topicError">{{ topicError }}</p>
        </div>

        <div *ngIf="loadingTopics" class="state-empty">
          <span class="pulse-bar"></span>
          <p>Carregando...</p>
        </div>

        <div *ngIf="!loadingTopics && topics.length === 0" class="state-empty">
          <span class="sep-short"></span>
          <p>Nenhum tópico cadastrado</p>
        </div>

        <div *ngIf="!loadingTopics">
          <div
            *ngFor="let t of topics"
            class="topic-card"
            [class.selected]="selectedTopic?.id === t.id"
            (click)="selectTopic(t)">

            <!-- Card header: info + action buttons -->
            <div class="topic-card-header">
              <div class="topic-info">
                <div class="topic-name">{{ t.name }}</div>
                <div class="topic-slug">/{{ t.slug }}</div>
              </div>
              <div class="topic-card-actions" (click)="$event.stopPropagation()">
                <button class="btn-icon" title="Editar tópico" (click)="startEditTopic(t)">✎</button>
                <button class="btn-icon btn-icon-danger" title="Remover tópico" (click)="deleteTopic(t)">✕</button>
              </div>
            </div>

            <!-- Normal display content -->
            <ng-container *ngIf="editingTopicId !== t.id">
              <div class="topic-desc" *ngIf="t.description">{{ t.description }}</div>
              <div class="topic-badges">
                <span class="tag" [class.tag-pale]="t.active" [class.tag-ghost]="!t.active">
                  {{ t.active ? 'Ativo' : 'Inativo' }}
                </span>
                <span class="tag tag-amber" *ngIf="t.autoPublish">Auto-publish</span>
                <span class="tag tag-ghost" *ngIf="t.requireApproval">Aprovação manual</span>
              </div>
            </ng-container>

            <!-- Inline edit form -->
            <div class="inline-edit-form" *ngIf="editingTopicId === t.id" (click)="$event.stopPropagation()">
              <div class="inline-form-row">
                <label>Nome *</label>
                <input [(ngModel)]="editTopicForm.name" placeholder="Nome do tópico"/>
              </div>
              <div class="inline-form-row">
                <label>Descrição</label>
                <textarea [(ngModel)]="editTopicForm.description" placeholder="Descrição..."></textarea>
              </div>
              <div class="inline-form-row">
                <label class="inline-form-check">
                  <input type="checkbox" [(ngModel)]="editTopicForm.autoPublish"/>
                  Auto-publicar posts gerados
                </label>
              </div>
              <div class="inline-form-row">
                <label class="inline-form-check">
                  <input type="checkbox" [(ngModel)]="editTopicForm.requireApproval"/>
                  Exigir aprovação manual antes da IA
                </label>
              </div>
              <div class="inline-form-actions">
                <button class="btn-save-sm" (click)="updateTopic(t.id)" [disabled]="savingEditTopic">
                  {{ savingEditTopic ? 'Salvando…' : 'Salvar' }}
                </button>
                <button class="btn-cancel-sm" (click)="cancelEditTopic()">Cancelar</button>
              </div>
              <p class="form-error" *ngIf="editTopicError">{{ editTopicError }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: sources panel -->
      <div class="panel panel-right">
        <ng-container *ngIf="!selectedTopic">
          <div class="panel-placeholder">
            <span class="placeholder-icon">←</span>
            <p class="placeholder-text">Selecione um tópico para gerenciar suas fontes</p>
          </div>
        </ng-container>

        <ng-container *ngIf="selectedTopic">
          <div class="panel-header">
            <div>
              <span class="panel-title">Fontes</span>
              <span class="panel-count" *ngIf="!loadingSources">{{ sources.length }}</span>
              <span class="panel-topic-name">— {{ selectedTopic.name }}</span>
            </div>
            <button class="btn-new" [class.open]="showAddSource" (click)="toggleAddSource()">
              {{ showAddSource ? '— Cancelar' : '+ Fonte' }}
            </button>
          </div>

          <div class="form-panel" *ngIf="showAddSource">
            <p class="form-title">Nova Fonte</p>
            <div class="form-row">
              <label>URL *</label>
              <input [(ngModel)]="newSource.url" placeholder="https://..."/>
            </div>
            <div class="form-row">
              <label>Tipo *</label>
              <select [(ngModel)]="newSource.type">
                <option value="RSS">RSS — Feed RSS/Atom</option>
                <option value="HTML">HTML — Scraping de página</option>
              </select>
            </div>
            <div class="form-actions">
              <button class="btn-submit" (click)="addSource()" [disabled]="savingSource">
                {{ savingSource ? 'Salvando...' : 'Adicionar Fonte' }}
              </button>
              <button class="btn-cancel" (click)="toggleAddSource()">Cancelar</button>
            </div>
            <p class="form-error" *ngIf="sourceError">{{ sourceError }}</p>
          </div>

          <div *ngIf="loadingSources" class="state-empty">
            <span class="pulse-bar"></span>
            <p>Carregando fontes...</p>
          </div>

          <div *ngIf="!loadingSources && sources.length === 0" class="state-empty">
            <span class="sep-short"></span>
            <p>Nenhuma fonte cadastrada para este tópico</p>
          </div>

          <ng-container *ngIf="!loadingSources && sources.length > 0">
            <ng-container *ngFor="let s of sources">
              <!-- Normal source row -->
              <div class="source-item" *ngIf="editingSourceId !== s.id">
                <span class="tag" [class.tag-green]="s.type === 'RSS'" [class.tag-ghost]="s.type !== 'RSS'">
                  {{ s.type }}
                </span>
                <span class="source-url" [title]="s.url">{{ s.url }}</span>
                <button class="btn-icon" (click)="startEditSource(s)" title="Editar fonte">✎</button>
                <button class="btn-delete" (click)="deleteSource(s.id)" title="Remover fonte">✕</button>
              </div>
              <!-- Inline source edit form -->
              <div class="source-edit-form" *ngIf="editingSourceId === s.id">
                <p class="source-edit-title">Editar Fonte</p>
                <div class="form-row">
                  <label>URL *</label>
                  <input [(ngModel)]="editSourceForm.url" placeholder="https://..."/>
                </div>
                <div class="form-row">
                  <label>Tipo *</label>
                  <select [(ngModel)]="editSourceForm.type" class="form-row">
                    <option value="RSS">RSS — Feed RSS/Atom</option>
                    <option value="HTML">HTML — Scraping de página</option>
                  </select>
                </div>
                <div class="form-actions">
                  <button class="btn-save-sm" (click)="updateSource(s.id)" [disabled]="savingEditSource">
                    {{ savingEditSource ? 'Salvando…' : 'Salvar' }}
                  </button>
                  <button class="btn-cancel-sm" (click)="cancelEditSource()">Cancelar</button>
                </div>
                <p class="form-error" *ngIf="editSourceError">{{ editSourceError }}</p>
              </div>
            </ng-container>
          </ng-container>
        </ng-container>
      </div>
    </div>
  `
})
export class AdminTopicsComponent implements OnInit {
  private api = inject(ApiService);

  topics: Topic[] = [];
  selectedTopic: Topic | null = null;
  sources: Source[] = [];

  loadingTopics = true;
  loadingSources = false;
  savingTopic = false;
  savingSource = false;

  showCreateTopic = false;
  showAddSource = false;

  topicError = '';
  sourceError = '';

  newTopic = { name: '', slug: '', description: '', autoPublish: false, requireApproval: false };
  newSource = { url: '', type: 'RSS' as 'RSS' | 'HTML' };

  // Edit topic state
  editingTopicId: number | null = null;
  editTopicForm = { name: '', description: '', autoPublish: false, requireApproval: false };
  savingEditTopic = false;
  editTopicError = '';

  // Edit source state
  editingSourceId: number | null = null;
  editSourceForm = { url: '', type: 'RSS' as 'RSS' | 'HTML' };
  savingEditSource = false;
  editSourceError = '';

  ngOnInit(): void {
    this.loadTopics();
  }

  selectTopic(topic: Topic): void {
    if (this.editingTopicId === topic.id) return;
    this.selectedTopic = topic;
    this.showAddSource = false;
    this.sourceError = '';
    this.editingSourceId = null;
    this.newSource = { url: '', type: 'RSS' };
    this.loadSources(topic.id);
  }

  toggleCreateTopic(): void {
    this.showCreateTopic = !this.showCreateTopic;
    this.topicError = '';
    this.newTopic = { name: '', slug: '', description: '', autoPublish: false, requireApproval: false };
    if (this.showCreateTopic) this.editingTopicId = null;
  }

  toggleAddSource(): void {
    this.showAddSource = !this.showAddSource;
    this.sourceError = '';
    this.newSource = { url: '', type: 'RSS' };
    if (this.showAddSource) this.editingSourceId = null;
  }

  autoSlug(): void {
    this.newTopic.slug = this.newTopic.name
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  createTopic(): void {
    this.topicError = '';
    if (!this.newTopic.name.trim() || !this.newTopic.slug.trim()) {
      this.topicError = 'Nome e slug são obrigatórios.';
      return;
    }
    if (!/^[a-z0-9-]+$/.test(this.newTopic.slug)) {
      this.topicError = 'Slug deve conter apenas letras minúsculas, números e hífens.';
      return;
    }
    this.savingTopic = true;
    this.api.post<Topic>('/admin/topics', this.newTopic).subscribe({
      next: (topic) => {
        this.topics.push(topic);
        this.savingTopic = false;
        this.showCreateTopic = false;
        this.newTopic = { name: '', slug: '', description: '', autoPublish: false, requireApproval: false };
      },
      error: (err) => {
        this.savingTopic = false;
        this.topicError = err?.error?.message ?? 'Erro ao criar tópico.';
      }
    });
  }

  startEditTopic(topic: Topic): void {
    this.showCreateTopic = false;
    this.editingTopicId = topic.id;
    this.editTopicForm = { name: topic.name, description: topic.description ?? '', autoPublish: topic.autoPublish, requireApproval: topic.requireApproval };
    this.editTopicError = '';
  }

  cancelEditTopic(): void {
    this.editingTopicId = null;
    this.editTopicError = '';
  }

  updateTopic(id: number): void {
    if (!this.editTopicForm.name.trim()) {
      this.editTopicError = 'Nome é obrigatório.';
      return;
    }
    this.savingEditTopic = true;
    this.editTopicError = '';
    this.api.put<Topic>(`/admin/topics/${id}`, this.editTopicForm).subscribe({
      next: (updated) => {
        this.topics = this.topics.map(t => t.id === id ? updated : t);
        if (this.selectedTopic?.id === id) {
          this.selectedTopic = updated;
        }
        this.editingTopicId = null;
        this.savingEditTopic = false;
      },
      error: (err) => {
        this.editTopicError = err?.error?.message ?? 'Erro ao atualizar tópico.';
        this.savingEditTopic = false;
      }
    });
  }

  deleteTopic(topic: Topic): void {
    this.api.delete<void>(`/admin/topics/${topic.id}`).subscribe({
      next: () => {
        this.topics = this.topics.map(t => t.id === topic.id ? { ...t, active: false } : t);
        if (this.selectedTopic?.id === topic.id) {
          this.selectedTopic = null;
          this.sources = [];
        }
      }
    });
  }

  addSource(): void {
    this.sourceError = '';
    if (!this.newSource.url.trim()) {
      this.sourceError = 'URL é obrigatória.';
      return;
    }
    this.savingSource = true;
    this.api.post<Source>('/admin/sources', {
      topicId: this.selectedTopic!.id,
      url: this.newSource.url.trim(),
      type: this.newSource.type
    }).subscribe({
      next: (source) => {
        this.sources.push(source);
        this.savingSource = false;
        this.showAddSource = false;
        this.newSource = { url: '', type: 'RSS' };
      },
      error: (err) => {
        this.savingSource = false;
        this.sourceError = err?.error?.message ?? 'Erro ao adicionar fonte.';
      }
    });
  }

  startEditSource(source: Source): void {
    this.showAddSource = false;
    this.editingSourceId = source.id;
    this.editSourceForm = { url: source.url, type: source.type };
    this.editSourceError = '';
  }

  cancelEditSource(): void {
    this.editingSourceId = null;
    this.editSourceError = '';
  }

  updateSource(id: number): void {
    if (!this.editSourceForm.url.trim()) {
      this.editSourceError = 'URL é obrigatória.';
      return;
    }
    this.savingEditSource = true;
    this.editSourceError = '';
    this.api.patch<Source>(`/admin/sources/${id}`, this.editSourceForm).subscribe({
      next: (updated) => {
        this.sources = this.sources.map(s => s.id === id ? updated : s);
        this.editingSourceId = null;
        this.savingEditSource = false;
      },
      error: (err) => {
        this.editSourceError = err?.error?.message ?? 'Erro ao atualizar fonte.';
        this.savingEditSource = false;
      }
    });
  }

  deleteSource(id: number): void {
    this.api.delete<void>(`/admin/sources/${id}`).subscribe({
      next: () => {
        this.sources = this.sources.filter(s => s.id !== id);
      }
    });
  }

  private loadTopics(): void {
    this.api.get<Topic[]>('/admin/topics').subscribe({
      next: (topics) => {
        this.topics = topics;
        this.loadingTopics = false;
      },
      error: () => { this.loadingTopics = false; }
    });
  }

  private loadSources(topicId: number): void {
    this.loadingSources = true;
    this.api.get<Source[]>(`/admin/topics/${topicId}/sources`).subscribe({
      next: (sources) => {
        this.sources = sources;
        this.loadingSources = false;
      },
      error: () => { this.loadingSources = false; }
    });
  }
}
