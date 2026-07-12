import { effect, inject, Injectable, Injector } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConsentService } from './consent.service';

@Injectable({ providedIn: 'root' })
export class AdsenseService {
  private router = inject(Router);
  private consent = inject(ConsentService);
  private injector = inject(Injector);
  private loaded = false;

  init(): void {
    const client = environment.adsenseClientId;
    if (!client) {
      return;
    }
    effect(() => {
      if (this.consent.status() === 'granted' && !this.loaded) {
        this.loaded = true;
        this.whenOnPublicRoute(() => this.loadScript(client));
      }
    }, { injector: this.injector });
  }

  // Carrega só em página pública do blog, para os auto ads não
  // injetarem anúncios nas telas de admin/login
  private whenOnPublicRoute(load: () => void): void {
    if (this.router.url.startsWith('/blog')) {
      load();
      return;
    }
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        filter(event => event.urlAfterRedirects.startsWith('/blog')),
        take(1)
      )
      .subscribe(load);
  }

  private loadScript(client: string): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
}
