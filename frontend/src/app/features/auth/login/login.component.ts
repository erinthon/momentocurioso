import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h2>Login</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div>
          <label>Email</label>
          <input type="email" formControlName="email" autocomplete="email" />
        </div>
        <div>
          <label>Senha</label>
          <input type="password" formControlName="password" autocomplete="current-password" />
        </div>
        <p class="error" *ngIf="error">{{ error }}</p>
        <button type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      <p><a routerLink="/auth/register">Criar conta</a></p>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  error = '';
  loading = false;

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.authService.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/admin/topics']),
      error: () => {
        this.error = 'Email ou senha inválidos';
        this.loading = false;
      }
    });
  }
}
