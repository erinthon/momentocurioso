import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface Topic {
  id: number;
  name: string;
  slug: string;
  description: string;
  autoPublish: boolean;
  active: boolean;
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
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--ink); }

    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: rgba(11,11,18,.94);
      backdrop-filter: blur(18px);
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
      padding: 40px 2rem 32px;
      border-bottom: 1px solid var(--border);
    }
    .admin-label {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .2em;
      color: var(--gold); text-transform: uppercase; margin-bottom: 8px;
    }
    .admin-title {
      font-family: var(--font-display); font-weight: 800; font-size: 36px;
      color: var(--bright); letter-spacing: -1.5px; margin-bottom: 0;
    }

    .layout {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 0;
      min-height: calc(100vh - 148px);
    }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .panel-right { border-left: none; border-top: 1px solid var(--border); }
    }

    .panel { padding: 32px; overflow-y: auto; }
    .panel-left { border-right: 1px solid var(--border); }
    .panel-right { background: var(--ink-1); }

    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 24px;
    }
    .panel-title {
      font-family: var(--font-display); font-weight: 800; font-size: 16px;
      color: var(--bright); letter-spacing: -.3px;
    }
    .panel-count {
      font-family: var(--font-mono); font-size: 10px; color: var(--dim);
      letter-spacing: .12em; margin-left: 8px;
    }
    .btn-new {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .1em;
      text-transform: uppercase; background: none;
      border: 1px solid var(--gold); color: var(--gold);
      padding: 6px 14px; cursor: pointer; border-radius: 2px;
      transition: background var(--transition-fast), color var(--transition-fast);
      &:hover { background: var(--gold); color: var(--ink); }
    }
    .btn-new.open { background: var(--gold); color: var(--ink); }

    .form-panel {
      background: var(--ink-2); border: 1px solid var(--border);
      padding: 20px; margin-bottom: 24px;
    }
    .form-title {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .16em;
      color: var(--gold); text-transform: uppercase; margin-bottom: 16px;
    }
    .form-row { margin-bottom: 14px; }
    .form-row label {
      display: block; font-family: var(--font-mono); font-size: 10px;
      letter-spacing: .12em; color: var(--mid); text-transform: uppercase;
      margin-bottom: 6px;
    }
    .form-row input, .form-row select, .form-row textarea {
      width: 100%; box-sizing: border-box;
      background: var(--ink); border: 1px solid var(--border);
      color: var(--bright); font-family: var(--font-body); font-size: 14px;
      padding: 8px 12px; outline: none;
      transition: border-color var(--transition-fast);
      &:focus { border-color: var(--gold); }
      &::placeholder { color: var(--dim); }
    }
    .form-row textarea { resize: vertical; min-height: 64px; }
    .form-row select { cursor: pointer; }
    .form-check {
      display: flex; align-items: center; gap: 10px;
      font-family: var(--font-body); font-size: 14px; color: var(--mid);
      cursor: pointer;
    }
    .form-check input[type=checkbox] { accent-color: var(--gold); width: 16px; height: 16px; cursor: pointer; }
    .form-actions { display: flex; gap: 10px; margin-top: 16px; }
    .btn-submit {
      font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em;
      text-transform: uppercase; background: var(--gold); color: var(--ink);
      border: none; padding: 8px 20px; cursor: pointer;
      transition: opacity var(--transition-fast);
      &:hover { opacity: .85; }
      &:disabled { opacity: .4; cursor: not-allowed; }
    }
    .btn-cancel {
      font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em;
      text-transform: uppercase; background: none; color: var(--mid);
      border: 1px solid var(--border); padding: 8px 16px; cursor: pointer;
      transition: color var(--transition-fast), border-color var(--transition-fast);
      &:hover { color: var(--bright); border-color: var(--mid); }
    }
    .form-error {
      font-family: var(--font-mono); font-size: 11px; color: var(--coral);
      letter-spacing: .08em; margin-top: 8px;
    }

    .topic-card {
      border: 1px solid var(--border); padding: 18px 20px;
      margin-bottom: 1px; cursor: pointer;
      background: var(--ink-1);
      transition: background var(--transition-base), border-color var(--transition-base);
      &:hover { background: var(--ink-2); border-color: var(--gold); }
      &.selected { background: var(--ink-2); border-color: var(--gold); border-left-width: 3px; }
    }
    .topic-name {
      font-family: var(--font-display); font-weight: 800; font-size: 15px;
      color: var(--bright); letter-spacing: -.3px; margin-bottom: 4px;
    }
    .topic-slug {
      font-family: var(--font-mono); font-size: 10px; color: var(--gold);
      letter-spacing: .12em; margin-bottom: 6px;
    }
    .topic-desc {
      font-family: var(--font-body); font-size: 13px; color: var(--mid);
      line-height: 1.5; margin-bottom: 10px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .topic-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .badge {
      font-family: var(--font-mono); font-size: 9px; letter-spacing: .1em;
      text-transform: uppercase; padding: 2px 7px; border-radius: var(--radius-tag);
    }
    .badge-active { background: rgba(245,197,24,.15); color: var(--gold); border: 1px solid rgba(245,197,24,.3); }
    .badge-inactive { background: var(--ink-3); color: var(--dim); border: 1px solid var(--border); }
    .badge-auto { background: rgba(255,77,46,.1); color: var(--coral); border: 1px solid rgba(255,77,46,.25); }

    .source-item {
      display: flex; align-items: center; gap: 12px;
      border: 1px solid var(--border); padding: 14px 16px;
      margin-bottom: 1px; background: var(--ink);
      transition: border-color var(--transition-fast);
      &:hover { border-color: var(--dim); }
      &:hover .btn-delete { opacity: 1; }
    }
    .source-type {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .1em;
      text-transform: uppercase; padding: 3px 8px;
      border-radius: var(--radius-tag); flex-shrink: 0;
    }
    .type-rss { background: rgba(245,197,24,.12); color: var(--gold); border: 1px solid rgba(245,197,24,.25); }
    .type-html { background: rgba(124,124,142,.12); color: var(--mid); border: 1px solid var(--border); }
    .source-url {
      font-family: var(--font-mono); font-size: 11px; color: var(--mid);
      letter-spacing: .04em; flex: 1; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap;
    }
    .btn-delete {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .06em;
      background: none; border: 1px solid transparent; color: var(--dim);
      cursor: pointer; padding: 4px 8px; opacity: 0;
      transition: color var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast);
      flex-shrink: 0;
      &:hover { color: var(--coral); border-color: rgba(255,77,46,.4); }
    }

    .state-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; padding: 60px 0; text-align: center;
    }
    .state-empty p { font-family: var(--font-mono); font-size: 11px; color: var(--dim); letter-spacing: .12em; text-transform: uppercase; }
    .sep-gold { width: 34px; height: 2px; background: var(--gold); display: block; }

    .panel-placeholder {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; gap: 16px; color: var(--dim); padding: 60px 2rem; text-align: center;
    }
    .placeholder-icon { font-family: var(--font-display); font-weight: 800; font-size: 64px; color: rgba(245,197,24,.08); line-height: 1; }
    .placeholder-text { font-family: var(--font-mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; }

    .pulse { display: block; width: 34px; height: 2px; background: var(--gold); animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{opacity:1;width:34px}50%{opacity:.3;width:60px} }
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
        <a class="nav-link active" routerLink="/admin/topics">Tópicos</a>
        <a class="nav-link" routerLink="/admin/posts">Posts</a>
        <a class="nav-link" routerLink="/admin/jobs">Jobs</a>
        <a class="nav-link" routerLink="/admin/trigger">Trigger</a>
        <button class="nav-logout" (click)="logout()">Sair</button>
      </div>
    </nav>

    <div class="admin-header">
      <p class="admin-label">Admin · Gerenciamento</p>
      <h1 class="admin-title">Tópicos & Fontes</h1>
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

        <!-- Create topic form -->
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
          <div class="form-actions">
            <button class="btn-submit" (click)="createTopic()" [disabled]="savingTopic">
              {{ savingTopic ? 'Salvando...' : 'Criar Tópico' }}
            </button>
            <button class="btn-cancel" (click)="toggleCreateTopic()">Cancelar</button>
          </div>
          <p class="form-error" *ngIf="topicError">{{ topicError }}</p>
        </div>

        <!-- Topics list -->
        <div *ngIf="loadingTopics" class="state-empty">
          <span class="pulse"></span>
          <p>Carregando...</p>
        </div>

        <div *ngIf="!loadingTopics && topics.length === 0" class="state-empty">
          <span class="sep-gold"></span>
          <p>Nenhum tópico cadastrado</p>
        </div>

        <div *ngIf="!loadingTopics">
          <div
            *ngFor="let t of topics"
            class="topic-card"
            [class.selected]="selectedTopic?.id === t.id"
            (click)="selectTopic(t)">
            <div class="topic-name">{{ t.name }}</div>
            <div class="topic-slug">/{{ t.slug }}</div>
            <div class="topic-desc" *ngIf="t.description">{{ t.description }}</div>
            <div class="topic-meta">
              <span class="badge" [class.badge-active]="t.active" [class.badge-inactive]="!t.active">
                {{ t.active ? 'Ativo' : 'Inativo' }}
              </span>
              <span class="badge badge-auto" *ngIf="t.autoPublish">Auto-publish</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: sources panel -->
      <div class="panel panel-right">
        <ng-container *ngIf="!selectedTopic">
          <div class="panel-placeholder">
            <span class="placeholder-icon">?</span>
            <p class="placeholder-text">Selecione um tópico para gerenciar suas fontes</p>
          </div>
        </ng-container>

        <ng-container *ngIf="selectedTopic">
          <div class="panel-header">
            <div>
              <span class="panel-title">Fontes</span>
              <span class="panel-count" *ngIf="!loadingSources">{{ sources.length }}</span>
              <span style="font-family:var(--font-mono);font-size:10px;color:var(--gold);letter-spacing:.08em;margin-left:8px;">
                — {{ selectedTopic.name }}
              </span>
            </div>
            <button class="btn-new" [class.open]="showAddSource" (click)="toggleAddSource()">
              {{ showAddSource ? '— Cancelar' : '+ Fonte' }}
            </button>
          </div>

          <!-- Add source form -->
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

          <!-- Sources list -->
          <div *ngIf="loadingSources" class="state-empty">
            <span class="pulse"></span>
            <p>Carregando fontes...</p>
          </div>

          <div *ngIf="!loadingSources && sources.length === 0" class="state-empty">
            <span class="sep-gold"></span>
            <p>Nenhuma fonte cadastrada para este tópico</p>
          </div>

          <div *ngIf="!loadingSources && sources.length > 0">
            <div class="source-item" *ngFor="let s of sources">
              <span class="source-type" [class.type-rss]="s.type === 'RSS'" [class.type-html]="s.type === 'HTML'">
                {{ s.type }}
              </span>
              <span class="source-url" [title]="s.url">{{ s.url }}</span>
              <button class="btn-delete" (click)="deleteSource(s.id)" title="Remover fonte">✕</button>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class AdminTopicsComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

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

  newTopic = { name: '', slug: '', description: '', autoPublish: false };
  newSource = { url: '', type: 'RSS' as 'RSS' | 'HTML' };

  ngOnInit(): void {
    this.loadTopics();
  }

  selectTopic(topic: Topic): void {
    this.selectedTopic = topic;
    this.showAddSource = false;
    this.sourceError = '';
    this.newSource = { url: '', type: 'RSS' };
    this.loadSources(topic.id);
  }

  toggleCreateTopic(): void {
    this.showCreateTopic = !this.showCreateTopic;
    this.topicError = '';
    this.newTopic = { name: '', slug: '', description: '', autoPublish: false };
  }

  toggleAddSource(): void {
    this.showAddSource = !this.showAddSource;
    this.sourceError = '';
    this.newSource = { url: '', type: 'RSS' };
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
        this.newTopic = { name: '', slug: '', description: '', autoPublish: false };
      },
      error: (err) => {
        this.savingTopic = false;
        this.topicError = err?.error?.message ?? 'Erro ao criar tópico.';
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

  deleteSource(id: number): void {
    this.api.delete<void>(`/admin/sources/${id}`).subscribe({
      next: () => {
        this.sources = this.sources.filter(s => s.id !== id);
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  private loadTopics(): void {
    this.api.get<Topic[]>('/topics').subscribe({
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
