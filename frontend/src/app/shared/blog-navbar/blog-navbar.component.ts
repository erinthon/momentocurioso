import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LogoMarkComponent } from '../logo-mark/logo-mark.component';

@Component({
  selector: 'app-blog-navbar',
  standalone: true,
  imports: [RouterLink, LogoMarkComponent],
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

    .rss-link {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%;
      color: var(--text-3); transition: color var(--t);
      &:hover { color: var(--green); }
      svg { display: block; }
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
        <a class="rss-link" href="/api/feed.xml" target="_blank" title="Feed RSS" aria-label="Feed RSS">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="3" cy="13" r="2"/>
            <path d="M1 6.5a.5.5 0 0 1 .5-.5C7.3 6 10 8.7 10 14.5a.5.5 0 0 1-1 0C9 9.25 6.75 7 1.5 7a.5.5 0 0 1-.5-.5Z"/>
            <path d="M1 2.5a.5.5 0 0 1 .5-.5C9.6 2 14 6.4 14 14.5a.5.5 0 0 1-1 0C13 7 9 3 1.5 3a.5.5 0 0 1-.5-.5Z"/>
          </svg>
        </a>
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
