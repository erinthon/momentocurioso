import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface NewsletterMessage {
  message: string;
}

@Component({
  selector: 'app-newsletter-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    :host { display: block; }
    .newsletter {
      position: relative; overflow: hidden;
      max-width: 1100px; margin: 42px auto; padding: 34px 38px;
      display: grid; grid-template-columns: 1fr minmax(320px, 480px); gap: 36px; align-items: center;
      background: var(--green); color: #fff; border-radius: var(--rl);
      box-shadow: var(--shadow-lg);
    }
    .newsletter::after {
      content: '?'; position: absolute; right: -18px; top: -54px;
      font-family: var(--fd); font-size: 220px; font-weight: 800;
      color: rgba(255,255,255,.06); pointer-events: none;
    }
    :host-context([data-theme="dark"]) .newsletter {
      background: var(--bg-2); color: var(--text);
      border: 1px solid var(--border-2); border-left: 4px solid var(--green);
    }
    :host-context([data-theme="dark"]) .description { color: var(--text-2); }
    :host-context([data-theme="dark"]) input[type="text"],
    :host-context([data-theme="dark"]) input[type="email"] {
      background: var(--bg-1); color: var(--text); border-color: var(--border-2);
    }
    :host-context([data-theme="dark"]) input::placeholder { color: var(--text-3); }
    :host-context([data-theme="dark"]) button { background: var(--green); color: var(--bg); }
    :host-context([data-theme="dark"]) .consent { color: var(--text-2); }
    :host-context([data-theme="dark"]) .consent a { color: var(--green-2); }
    .eyebrow { font-family: var(--fu); font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; opacity: .72; }
    h2 { margin: 8px 0 10px; font-family: var(--fd); font-size: clamp(25px, 3vw, 36px); letter-spacing: -.7px; line-height: 1.1; }
    .description { margin: 0; max-width: 520px; font-family: var(--fb); font-size: 14px; line-height: 1.65; color: rgba(255,255,255,.82); }
    .form { position: relative; z-index: 1; }
    .fields { display: grid; grid-template-columns: .8fr 1.2fr auto; gap: 8px; }
    input[type="text"], input[type="email"] {
      min-width: 0; padding: 12px 13px; border: 1px solid rgba(255,255,255,.35);
      border-radius: var(--r); background: rgba(255,255,255,.12); color: #fff;
      font-family: var(--fu); font-size: 13px; outline: none;
    }
    input::placeholder { color: rgba(255,255,255,.65); }
    input:focus { border-color: #fff; background: rgba(255,255,255,.18); }
    button {
      padding: 12px 18px; border: 0; border-radius: var(--r); cursor: pointer;
      background: #fff; color: var(--green); font-family: var(--fu); font-size: 13px; font-weight: 700;
    }
    button:disabled { opacity: .6; cursor: wait; }
    .consent { display: flex; gap: 8px; align-items: flex-start; margin-top: 10px; font-family: var(--fu); font-size: 11px; line-height: 1.4; color: rgba(255,255,255,.76); }
    .consent a { color: #fff; }
    .message { margin: 12px 0 0; font-family: var(--fu); font-size: 12px; font-weight: 600; }
    .message.error { color: #ffd5d0; }
    .honeypot { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
    @media (max-width: 820px) {
      .newsletter { margin: 28px 1rem; padding: 28px 24px; grid-template-columns: 1fr; gap: 22px; }
    }
    @media (max-width: 560px) {
      .fields { grid-template-columns: 1fr; }
    }
  `],
  template: `
    <section class="newsletter" aria-labelledby="newsletter-title">
      <div>
        <span class="eyebrow">Audiência própria · Toda semana</span>
        <h2 id="newsletter-title">{{ title }}</h2>
        <p class="description">
          A melhor história da semana, três curiosidades rápidas, um vídeo, uma recomendação e uma pergunta para você.
        </p>
      </div>

      <form class="form" (ngSubmit)="subscribe()">
        <div class="honeypot" aria-hidden="true">
          <label for="newsletter-website">Website</label>
          <input id="newsletter-website" name="website" type="text" [(ngModel)]="website" tabindex="-1" autocomplete="off" />
        </div>
        <div class="fields">
          <input name="name" type="text" maxlength="100" [(ngModel)]="name" placeholder="Seu nome (opcional)" autocomplete="name" />
          <input name="email" type="email" maxlength="320" [(ngModel)]="email" placeholder="voce&#64;email.com" autocomplete="email" required />
          <button type="submit" [disabled]="sending || !email || !consent">{{ sending ? 'Enviando...' : 'Quero receber' }}</button>
        </div>
        <label class="consent">
          <input name="consent" type="checkbox" [(ngModel)]="consent" />
          <span>Concordo em receber a newsletter do Momento Curioso. Posso cancelar quando quiser. Consulte a <a routerLink="/privacidade">Política de Privacidade</a>.</span>
        </label>
        <p class="message" [class.error]="hasError" *ngIf="message" role="status">{{ message }}</p>
      </form>
    </section>
  `
})
export class NewsletterSignupComponent {
  private api = inject(ApiService);

  @Input() title = 'A Dose Semanal de Curiosidade';

  name = '';
  email = '';
  website = '';
  consent = false;
  sending = false;
  hasError = false;
  message = '';

  subscribe(): void {
    if (!this.email || !this.consent || this.sending) return;
    this.sending = true;
    this.hasError = false;
    this.message = '';
    this.api.post<NewsletterMessage>('/newsletter/subscriptions', {
      email: this.email,
      name: this.name,
      consent: this.consent,
      website: this.website
    }).subscribe({
      next: response => {
        this.sending = false;
        this.message = response.message;
        this.email = '';
        this.name = '';
        this.consent = false;
      },
      error: error => {
        this.sending = false;
        this.hasError = true;
        this.message = error?.error?.message ?? 'Não foi possível concluir agora. Tente novamente em instantes.';
      }
    });
  }
}
