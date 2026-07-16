import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BlogFooterComponent } from '../../shared/blog-footer/blog-footer.component';
import { BlogNavbarComponent } from '../../shared/blog-navbar/blog-navbar.component';

interface NewsletterMessage {
  message: string;
}

@Component({
  selector: 'app-newsletter-action',
  standalone: true,
  imports: [CommonModule, RouterLink, BlogNavbarComponent, BlogFooterComponent],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--bg); }
    main { min-height: 58vh; display: grid; place-items: center; padding: 64px 1rem; }
    .card { max-width: 560px; padding: 42px; text-align: center; background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--rl); box-shadow: var(--shadow-lg); }
    .mark { display: inline-grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: var(--green-pale); color: var(--green); font-size: 24px; font-weight: 800; }
    h1 { font-family: var(--fd); font-size: 30px; color: var(--text); margin: 18px 0 10px; }
    p { font-family: var(--fb); font-size: 15px; line-height: 1.65; color: var(--text-3); }
    .actions { display: flex; justify-content: center; gap: 10px; margin-top: 24px; }
    .btn { padding: 10px 18px; border-radius: var(--r); font-family: var(--fu); font-size: 13px; font-weight: 700; text-decoration: none; cursor: pointer; }
    .primary { border: 0; background: var(--green); color: #fff; }
    .secondary { border: 1px solid var(--border); color: var(--text-2); background: transparent; }
    .error { color: var(--coral); }
  `],
  template: `
    <app-blog-navbar />
    <main>
      <section class="card">
        <span class="mark">?</span>
        <h1>{{ title }}</h1>
        <p [class.error]="hasError">{{ message }}</p>
        <div class="actions">
          <button *ngIf="action === 'unsubscribe' && !completed" class="btn primary" (click)="execute()" [disabled]="loading">
            {{ loading ? 'Cancelando...' : 'Confirmar cancelamento' }}
          </button>
          <a class="btn secondary" routerLink="/blog/posts">Voltar ao blog</a>
        </div>
      </section>
    </main>
    <app-blog-footer />
  `
})
export class NewsletterActionComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  action: 'confirm' | 'unsubscribe' = 'confirm';
  title = 'Newsletter';
  message = '';
  loading = false;
  completed = false;
  hasError = false;
  private token = '';

  ngOnInit(): void {
    this.action = this.route.snapshot.data['action'];
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.title = this.action === 'confirm' ? 'Confirme sua curiosidade' : 'Cancelar inscrição';
    this.message = this.action === 'confirm'
      ? 'Estamos confirmando sua inscrição...'
      : 'Você deixará de receber as próximas edições da Dose Semanal de Curiosidade.';
    if (this.action === 'confirm') this.execute();
  }

  execute(): void {
    if (!this.token) {
      this.hasError = true;
      this.message = 'Este link é inválido ou está incompleto.';
      return;
    }
    this.loading = true;
    this.api.post<NewsletterMessage>(`/newsletter/${this.action}`, { token: this.token }).subscribe({
      next: response => {
        this.loading = false;
        this.completed = true;
        this.message = response.message;
      },
      error: error => {
        this.loading = false;
        this.hasError = true;
        this.message = error?.error?.message ?? 'Não foi possível processar este link.';
      }
    });
  }
}
