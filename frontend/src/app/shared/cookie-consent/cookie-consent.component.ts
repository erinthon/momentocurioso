import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { ConsentService } from '../../core/services/consent.service';

// Páginas públicas: é onde o tracking acontece e onde o visitante decide sobre ele
const PUBLIC_PREFIXES = ['/blog', '/privacidade', '/termos'];

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    .cookie-banner {
      position: fixed;
      left: 50%;
      bottom: 20px;
      transform: translateX(-50%);
      z-index: 10000;
      width: min(680px, calc(100vw - 32px));
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 18px 22px;
      background: var(--bg-1);
      border: 1px solid var(--border);
      border-radius: var(--rl);
      box-shadow: var(--shadow-lg);
    }

    .cookie-text {
      flex: 1;
      font-family: var(--fu);
      font-size: 13px;
      line-height: 1.55;
      color: var(--text-2);
    }

    .cookie-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }

    .cookie-link {
      color: var(--green);
      text-decoration: none;
      border-bottom: 1px solid rgba(10,124,56,.25);
      transition: border-color var(--t);
      &:hover { border-color: var(--green); }
    }

    .cookie-chip {
      position: fixed;
      left: 16px;
      bottom: 16px;
      z-index: 10000;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      background: var(--bg-1);
      border: 1px solid var(--border);
      border-radius: 50%;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      opacity: .55;
      transition: opacity var(--t), box-shadow var(--t);
      &:hover { opacity: 1; box-shadow: var(--shadow-md); }
    }

    @media (max-width: 560px) {
      .cookie-banner { flex-direction: column; align-items: stretch; text-align: center; }
      .cookie-actions { justify-content: center; }
    }
  `],
  template: `
    @if (showBanner()) {
      <div class="cookie-banner" role="dialog" aria-live="polite" aria-label="Consentimento de cookies">
        <p class="cookie-text">
          🍪 Usamos cookies para medir a audiência (Google Analytics). O site funciona
          normalmente se você recusar. Detalhes na
          <a class="cookie-link" routerLink="/privacidade">Política de Privacidade</a>.
        </p>
        <div class="cookie-actions">
          <button class="btn btn-ghost" (click)="reject()">Recusar</button>
          <button class="btn btn-primary" (click)="accept()">Aceitar</button>
        </div>
      </div>
    }
    @if (showChip()) {
      <button class="cookie-chip" (click)="reopen()" title="Preferências de cookies"
              aria-label="Preferências de cookies">🍪</button>
    }
  `
})
export class CookieConsentComponent {
  private consent = inject(ConsentService);
  private router = inject(Router);

  private readonly currentUrl = signal(this.router.url);

  private readonly onPublicPage = computed(() =>
    PUBLIC_PREFIXES.some(prefix => this.currentUrl().startsWith(prefix)));

  readonly showBanner = computed(() =>
    this.onPublicPage() && (this.consent.status() === 'pending' || this.consent.reopened()));

  readonly showChip = computed(() =>
    this.onPublicPage() && this.consent.status() !== 'pending' && !this.consent.reopened());

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(event => this.currentUrl.set(event.urlAfterRedirects));
  }

  accept(): void {
    this.consent.grant();
  }

  reject(): void {
    this.consent.deny();
  }

  reopen(): void {
    this.consent.reopen();
  }
}
