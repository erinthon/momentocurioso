import { effect, inject, Injectable, Injector } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConsentService } from './consent.service';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Áreas privadas ficam fora das métricas do blog
const PRIVATE_PREFIXES = ['/admin', '/home', '/auth'];

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private router = inject(Router);
  private consent = inject(ConsentService);
  private injector = inject(Injector);
  private loaded = false;

  init(): void {
    const id = environment.googleAnalyticsId;
    if (!id) {
      return;
    }
    effect(() => {
      if (this.consent.status() === 'granted' && !this.loaded) {
        this.loaded = true;
        this.start(id);
      }
    }, { injector: this.injector });
  }

  private start(id: string): void {
    this.loadGtag(id);
    // O consentimento pode chegar depois da navegação inicial —
    // registra a página atual e segue acompanhando o router
    this.trackPageView(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.trackPageView(event.urlAfterRedirects));
  }

  private loadGtag(id: string): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    // gtag.js exige o objeto arguments no dataLayer — arrays comuns são ignorados
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    // page_view manual: em SPA o config só registraria a primeira página
    window.gtag('config', id, { send_page_view: false });
  }

  private trackPageView(url: string): void {
    if (PRIVATE_PREFIXES.some(prefix => url.startsWith(prefix))) {
      return;
    }
    // Adia para o componente da rota já ter atualizado o document.title
    setTimeout(() => {
      window.gtag('event', 'page_view', {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title
      });
    });
  }
}
