import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1rem;">
      <h1>Momento Curioso</h1>
      <p>Painel em desenvolvimento.</p>
      <button (click)="logout()"
        style="padding:.5rem 1.5rem;background:#4f46e5;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:1rem;">
        Sair
      </button>
    </div>
  `
})
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
