import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdsenseService {
  private router = inject(Router);

  init(): void {
    const client = environment.adsenseClientId;
    if (!client) {
      return;
    }
    // Carrega só quando o visitante chega a uma página pública do blog,
    // para os auto ads não injetarem anúncios nas telas de admin/login
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        filter(event => event.urlAfterRedirects.startsWith('/blog')),
        take(1)
      )
      .subscribe(() => this.loadScript(client));
  }

  private loadScript(client: string): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
}
