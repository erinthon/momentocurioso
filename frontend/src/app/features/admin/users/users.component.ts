import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';

type Role = 'USER' | 'WRITER' | 'ADMIN';

const ROLES: Role[] = ['USER', 'WRITER', 'ADMIN'];

const ROLE_HINTS: Record<Role, string> = {
  USER: 'Só leitura autenticada',
  WRITER: 'Gerencia posts e tópicos',
  ADMIN: 'Acesso total ao painel'
};

interface AppUser {
  id: number;
  email: string;
  role: Role;
}

interface UserForm {
  email: string;
  password: string;
  role: Role;
}

@Component({
  selector: 'app-admin-users',
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
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 160px; gap: 12px; }
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
    .form-hint { font-family: var(--fu); font-size: 11px; color: var(--text-4); }
    .form-actions { display: flex; align-items: center; justify-content: flex-end;
      gap: 10px; margin-top: 1rem; }
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
      display: grid; grid-template-columns: 1fr 170px 120px; align-items: center;
    }
    .table-head { padding: 0 1rem; border-bottom: 1px solid var(--border); }
    .th { padding: 10px 8px; font-family: var(--fu); font-size: 10px; font-weight: 600;
      letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); }
    .table-row {
      padding: 0 1rem; border-bottom: 1px solid var(--border); min-height: 56px;
      transition: background var(--t);
      &:last-child { border-bottom: none; }
      &:hover { background: var(--bg-2); }
    }
    .td { padding: 8px; font-family: var(--fu); font-size: 13px; color: var(--text-2); }
    .td-email { font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 8px; }

    .tag-self {
      padding: 1px 8px; border-radius: 20px; background: var(--green-pale);
      color: var(--green); font-size: 10px; font-weight: 700; letter-spacing: .06em;
      text-transform: uppercase;
    }
    .role-select {
      padding: 5px 10px; background: var(--bg); border: 1px solid var(--border);
      border-radius: var(--r); font-family: var(--fu); font-size: 12px; color: var(--text);
      cursor: pointer; outline: none;
      &:focus { border-color: var(--green); }
      &:disabled { opacity: .6; cursor: not-allowed; }
    }
    .btn-remove {
      padding: 5px 12px; background: none; border: 1px solid var(--border);
      border-radius: var(--r); font-family: var(--fu); font-size: 12px;
      color: var(--text-3); cursor: pointer; transition: all var(--t);
      &:hover:not(:disabled) { border-color: var(--coral); color: var(--coral); }
      &:disabled { opacity: .4; cursor: not-allowed; }
    }

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
            <span class="eyebrow-text">Admin · Usuários</span>
          </div>
          <h1 class="admin-title">Usuários</h1>
        </div>
        <button class="btn-new" (click)="startCreate()" [disabled]="showForm">+ Novo usuário</button>
      </div>

      <div class="form-panel" *ngIf="showForm">
        <h2 class="form-title">Novo usuário</h2>
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label" for="email">Email</label>
            <input id="email" class="form-input" type="email" [(ngModel)]="form.email"
                   autocomplete="off" placeholder="pessoa@exemplo.com"/>
          </div>
          <div class="form-field">
            <label class="form-label" for="password">Senha</label>
            <input id="password" class="form-input" type="password" [(ngModel)]="form.password"
                   autocomplete="new-password"/>
            <span class="form-hint">Mín. 8 caracteres, com maiúscula, minúscula e número.</span>
          </div>
          <div class="form-field">
            <label class="form-label" for="role">Papel</label>
            <select id="role" class="form-select" [(ngModel)]="form.role">
              <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
            </select>
            <span class="form-hint">{{ hintFor(form.role) }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-cancel" (click)="cancel()">Cancelar</button>
          <button class="btn-submit" (click)="save()" [disabled]="saving || !form.email || !form.password">
            {{ saving ? 'Criando...' : 'Criar usuário' }}
          </button>
        </div>
        <p class="form-error" *ngIf="error">{{ error }}</p>
      </div>

      <div class="table-wrapper">
        <div class="table-head">
          <span class="th">Email</span>
          <span class="th">Papel</span>
          <span class="th">Ações</span>
        </div>

        <div class="state-loading" *ngIf="loading">Carregando...</div>
        <div class="state-empty" *ngIf="!loading && users.length === 0">Nenhum usuário.</div>

        <div class="table-row" *ngFor="let user of users">
          <span class="td td-email">
            {{ user.email }}
            <span class="tag-self" *ngIf="isSelf(user)">Você</span>
          </span>
          <span class="td">
            <select class="role-select" [ngModel]="user.role" [disabled]="isSelf(user)"
                    (ngModelChange)="changeRole(user, $event)">
              <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
            </select>
          </span>
          <span class="td">
            <button class="btn-remove" (click)="remove(user)" [disabled]="isSelf(user)"
                    [title]="isSelf(user) ? 'Não é possível remover a própria conta' : 'Remover usuário'">
              Remover
            </button>
          </span>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  readonly roles = ROLES;

  users: AppUser[] = [];
  loading = true;
  saving = false;
  showForm = false;
  error = '';

  form: UserForm = this.emptyForm();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.get<AppUser[]>('/admin/users').subscribe({
      next: users => { this.users = users; this.loading = false; },
      error: () => { this.error = 'Não foi possível carregar os usuários.'; this.loading = false; }
    });
  }

  /** A própria conta não pode ser removida nem rebaixada — evita perder o acesso. */
  isSelf(user: AppUser): boolean {
    return user.email === this.auth.getEmail();
  }

  hintFor(role: Role): string {
    return ROLE_HINTS[role];
  }

  startCreate(): void {
    this.error = '';
    this.form = this.emptyForm();
    this.showForm = true;
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.api.post<AppUser>('/admin/users', this.form).subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.load();
      },
      error: err => {
        this.saving = false;
        this.error = this.messageOf(err, 'Não foi possível criar o usuário.');
      }
    });
  }

  changeRole(user: AppUser, role: Role): void {
    this.error = '';
    this.api.patch<AppUser>(`/admin/users/${user.id}/role`, { role }).subscribe({
      next: updated => user.role = updated.role,
      error: err => {
        this.error = this.messageOf(err, 'Não foi possível alterar o papel.');
        this.load();
      }
    });
  }

  remove(user: AppUser): void {
    if (!confirm(`Remover o usuário ${user.email}?`)) return;
    this.error = '';
    this.api.delete<void>(`/admin/users/${user.id}`).subscribe({
      next: () => this.load(),
      error: err => this.error = this.messageOf(err, 'Não foi possível remover o usuário.')
    });
  }

  cancel(): void {
    this.showForm = false;
    this.error = '';
  }

  private messageOf(err: unknown, fallback: string): string {
    const body = (err as { error?: { message?: string; errors?: Record<string, string> } })?.error;
    if (body?.errors) return Object.values(body.errors).join(' · ');
    return body?.message ?? fallback;
  }

  private emptyForm(): UserForm {
    return { email: '', password: '', role: 'WRITER' };
  }
}
