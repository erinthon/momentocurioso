import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LogoMarkComponent } from '../logo-mark/logo-mark.component';
import { SocialLinksComponent } from '../social-links/social-links.component';

@Component({
  selector: 'app-blog-navbar',
  standalone: true,
  imports: [RouterLink, LogoMarkComponent, SocialLinksComponent],
  styles: [`
    :host { display: block; }

    .navbar {
      position: sticky; top: 0; z-index: 100;
      height: 64px; padding: 0 2rem;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid var(--border);
      transition: background .3s;
    }
    :host-context([data-theme="light"]) .navbar { background: rgba(255,255,255,.9); backdrop-filter: blur(20px); }
    :host-context([data-theme="dark"])  .navbar { background: rgba(12,24,16,.9);   backdrop-filter: blur(20px); }

    .logo { display: flex; align-items: center; gap: 12px; text-decoration: none; cursor: pointer; }
    .wordmark { display: flex; flex-direction: column; line-height: 1; }
    .wordmark-top    { font-family: var(--fd); font-weight: 300; font-size: 9px; letter-spacing: .32em; text-transform: uppercase; color: var(--text-3); }
    .wordmark-main   { font-family: var(--fd); font-weight: 800; font-size: 18px; color: var(--green); letter-spacing: -.5px; line-height: 1.1; }
    .wordmark-tagline { font-family: var(--fu); font-size: 7px; color: var(--text-4); letter-spacing: .14em; margin-top: 1px; }

    .nav-right { display: flex; align-items: center; gap: 16px; }

    .nav-link {
      font-family: var(--fu); font-size: 13px; font-weight: 500;
      color: var(--text-3); text-decoration: none; transition: color var(--t);
      &:hover { color: var(--green); }
    }

    .theme-toggle {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 14px;
      background: var(--bg-1); border: 1px solid var(--border);
      border-radius: 40px; cursor: pointer;
      font-family: var(--fu); font-size: 12px; font-weight: 500; color: var(--text-3);
      transition: all var(--t);
      &:hover { border-color: var(--green); color: var(--green); }
    }

    .nav-social {
      --social-size: 32px;
      --social-gap: 2px;
      --social-border: none;
    }
    /* na navbar estreita sobra só o RSS; as redes seguem no footer */
    @media (max-width: 700px) {
      .nav-social { --social-brand-display: none; }
    }
  `],
  template: `
    <nav class="navbar">
      <a class="logo" routerLink="/blog/posts">
        <app-logo-mark />
        <div class="wordmark">
          <span class="wordmark-top">Momento</span>
          <span class="wordmark-main">Curioso</span>
          <span class="wordmark-tagline">Mate a sua curiosidade</span>
        </div>
      </a>
      <div class="nav-right">
        <app-social-links class="nav-social" />
        <button class="theme-toggle" (click)="theme.toggle()">
          {{ theme.isDark() ? '☀ Claro' : '☾ Escuro' }}
        </button>
      </div>
    </nav>
  `
})
export class BlogNavbarComponent {
  protected theme = inject(ThemeService);
}
