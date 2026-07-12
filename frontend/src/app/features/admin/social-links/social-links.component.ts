import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { SocialLink, SocialLinkService, SocialPlatform } from '../../../core/services/social-link.service';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';

const PLATFORMS: SocialPlatform[] = ['YOUTUBE', 'INSTAGRAM', 'X', 'TIKTOK', 'FACEBOOK', 'LINKEDIN'];

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  YOUTUBE: 'YouTube',
  INSTAGRAM: 'Instagram',
  X: 'X',
  TIKTOK: 'TikTok',
  FACEBOOK: 'Facebook',
  LINKEDIN: 'LinkedIn'
};

interface LinkForm {
  platform: SocialPlatform;
  url: string;
  active: boolean;
  displayOrder: number;
}

@Component({
  selector: 'app-admin-social-links',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--bg); }

    .page { max-width: 1100px; margin: 0 auto; padding: 2.5rem 2rem; }

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
      &:hover:not(:disabled) { background: var(--green-2); transform: translateY(-1px); }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }

    .form-panel {
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); padding: 1.5rem; margin-bottom: 1.5rem;
    }
    .form-title { font-family: var(--fd); font-weight: 700; font-size: 15px;
      color: var(--text); margin: 0 0 1.25rem; }
    .form-grid { display: grid; grid-template-columns: 180px 1fr 110px; gap: 12px; }
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
    .form-actions { display: flex; align-items: center; gap: 10px; margin-top: 1rem; }
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
    .form-error { font-family: var(--fu); font-size: 12px; color: var(--coral); margin-top: 8px; }

    .table-wrapper {
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: var(--r); overflow: hidden;
    }
    .table-head, .table-row {
      display: grid; grid-template-columns: 150px 1fr 90px 90px 170px; align-items: center;
    }
    .table-head { padding: 0 1rem; border-bottom: 1px solid var(--border); }
    .th { padding: 10px 8px; font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); }
    .table-row {
      padding: 0 1rem; border-bottom: 1px solid var(--border); min-height: 56px;
      transition: background var(--t);
      &:last-child { border-bottom: none; }
      &:hover { background: var(--bg-2); }
      &.inactive-row { opacity: .55; }
    }
    .td { padding: 8px; font-family: var(--fu); font-size: 13px; color: var(--text-2); }
    .td-name { font-weight: 600; color: var(--text); }
    .td-url { font-family: monospace; font-size: 12px; color: var(--text-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .td-actions { display: flex; gap: 8px; align-items: center; }

    .badge {
      display: inline-block; padding: 2px 9px; border-radius: 20px;
      font-family: var(--fu); font-size: 11px; font-weight: 600;
    }
    .badge-on  { background: var(--green-pale); color: var(--green); }
    .badge-off { background: var(--bg-2); color: var(--text-3); }

    .btn-edit, .btn-remove {
      padding: 5px 12px; background: none; border: 1px solid var(--border);
      border-radius: var(--r); font-family: var(--fu); font-size: 12px;
      color: var(--text-3); cursor: pointer; transition: all var(--t);
      white-space: nowrap;
    }
    .btn-edit:hover { border-color: var(--green); color: var(--green); }
    .btn-remove:hover { border-color: var(--coral); color: var(--coral); }

    .state-empty, .state-loading {
      padding: 3rem 1rem; text-align: center;
      font-family: var(--fu); font-size: 13px; color: var(--text-3);
    }
  `],
  template: `
    <app-admin-navbar />

    <div class="page">
      <div class="admin-header">
        <div class="header-left">
          <div class="eyebrow-line">
            <span class="sep-short"></span>
            <span class="eyebrow-text">Admin · Redes sociais</span>
          </div>
          <h1 class="admin-title">Redes sociais</h1>
        </div>
        <button class="btn-new" (click)="startCreate()" [disabled]="showForm || availablePlatforms().length === 0">
          + Nova rede
        </button>
      </div>

      <div class="form-panel" *ngIf="showForm">
        <h2 class="form-title">{{ editingId ? 'Editar link' : 'Nova rede' }}</h2>
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label" for="platform">Rede</label>
            <select id="platform" class="form-select" [(ngModel)]="form.platform" [disabled]="!!editingId">
              <option *ngFor="let p of platformOptions()" [value]="p">{{ labelOf(p) }}</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label" for="url">URL do perfil</label>
            <input id="url" class="form-input" type="url" [(ngModel)]="form.url"
                   placeholder="https://www.instagram.com/seu-perfil"/>
          </div>
          <div class="form-field">
            <label class="form-label" for="order">Ordem</label>
            <input id="order" class="form-input" type="number" [(ngModel)]="form.displayOrder"/>
          </div>
        </div>

        <div class="form-actions">
          <label class="form-label" style="display:flex;align-items:center;gap:6px;text-transform:none;letter-spacing:0;font-size:13px;">
            <input type="checkbox" [(ngModel)]="form.active"/> Exibir no site
          </label>
          <span style="flex:1"></span>
          <button class="btn-cancel" (click)="cancel()">Cancelar</button>
          <button class="btn-submit" (click)="save()" [disabled]="saving || !form.url">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
        <p class="form-error" *ngIf="error">{{ error }}</p>
      </div>

      <div class="table-wrapper">
        <div class="table-head">
          <span class="th">Rede</span>
          <span class="th">URL</span>
          <span class="th">Ordem</span>
          <span class="th">Status</span>
          <span class="th">Ações</span>
        </div>

        <div class="state-loading" *ngIf="loading">Carregando...</div>
        <div class="state-empty" *ngIf="!loading && links.length === 0">
          Nenhuma rede cadastrada.
        </div>

        <div class="table-row" *ngFor="let link of links" [class.inactive-row]="!link.active">
          <span class="td td-name">{{ labelOf(link.platform) }}</span>
          <span class="td td-url" [title]="link.url">{{ link.url }}</span>
          <span class="td">{{ link.displayOrder }}</span>
          <span class="td">
            <span class="badge" [class.badge-on]="link.active" [class.badge-off]="!link.active">
              {{ link.active ? 'No site' : 'Oculta' }}
            </span>
          </span>
          <span class="td td-actions">
            <button class="btn-edit" (click)="startEdit(link)">Editar</button>
            <button class="btn-remove" (click)="remove(link)">Remover</button>
          </span>
        </div>
      </div>
    </div>
  `
})
export class AdminSocialLinksComponent implements OnInit {
  private api = inject(ApiService);
  private socialLinkService = inject(SocialLinkService);

  links: SocialLink[] = [];
  loading = true;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  error = '';

  form: LinkForm = this.emptyForm();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.get<SocialLink[]>('/admin/social-links').subscribe({
      next: links => { this.links = links; this.loading = false; },
      error: () => { this.error = 'Não foi possível carregar as redes.'; this.loading = false; }
    });
  }

  labelOf(platform: SocialPlatform): string {
    return PLATFORM_LABELS[platform];
  }

  /** Redes ainda não cadastradas — uma plataforma só pode ter um link. */
  availablePlatforms(): SocialPlatform[] {
    const used = new Set(this.links.map(l => l.platform));
    return PLATFORMS.filter(p => !used.has(p));
  }

  platformOptions(): SocialPlatform[] {
    return this.editingId ? [this.form.platform] : this.availablePlatforms();
  }

  startCreate(): void {
    this.error = '';
    this.editingId = null;
    this.form = this.emptyForm();
    const available = this.availablePlatforms();
    if (available.length === 0) return;
    this.form.platform = available[0];
    this.form.displayOrder = this.links.length + 1;
    this.showForm = true;
  }

  startEdit(link: SocialLink): void {
    this.error = '';
    this.editingId = link.id;
    this.form = {
      platform: link.platform,
      url: link.url,
      active: link.active,
      displayOrder: link.displayOrder
    };
    this.showForm = true;
  }

  save(): void {
    this.saving = true;
    this.error = '';
    const request = this.editingId
      ? this.api.put<SocialLink>(`/admin/social-links/${this.editingId}`, this.form)
      : this.api.post<SocialLink>('/admin/social-links', this.form);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.socialLinkService.invalidate();
        this.load();
      },
      error: err => {
        this.saving = false;
        this.error = err?.error?.message ?? 'Não foi possível salvar o link.';
      }
    });
  }

  remove(link: SocialLink): void {
    if (!confirm(`Remover o link do ${this.labelOf(link.platform)}?`)) return;
    this.api.delete<void>(`/admin/social-links/${link.id}`).subscribe({
      next: () => {
        this.socialLinkService.invalidate();
        this.load();
      },
      error: () => this.error = 'Não foi possível remover o link.'
    });
  }

  cancel(): void {
    this.showForm = false;
    this.editingId = null;
    this.error = '';
  }

  private emptyForm(): LinkForm {
    return { platform: 'YOUTUBE', url: '', active: true, displayOrder: 0 };
  }
}
