import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
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

    .logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .wordmark { display: flex; flex-direction: column; line-height: 1; }
    .wordmark-top  { font-family: var(--fd); font-weight: 300; font-size: 9px; letter-spacing: .32em; text-transform: uppercase; color: var(--text-3); }
    .wordmark-main { font-family: var(--fd); font-weight: 800; font-size: 18px; color: var(--green); letter-spacing: -.5px; line-height: 1.1; }
    .wordmark-tag  { font-family: var(--fu); font-size: 7px; color: var(--text-4); letter-spacing: .14em; margin-top: 1px; }

    .nav-right { display: flex; align-items: center; gap: 20px; }

    .nav-link {
      font-family: var(--fu); font-size: 13px; font-weight: 500;
      color: var(--text-3); text-decoration: none;
      transition: color var(--t); padding-bottom: 2px;
      border-bottom: 2px solid transparent;
      &:hover { color: var(--text); }
      &.active { color: var(--green); border-bottom-color: var(--green); }
    }

    .nav-logout {
      font-family: var(--fu); font-size: 13px; font-weight: 500;
      color: var(--text-3); background: none; border: none;
      cursor: pointer; transition: color var(--t);
      &:hover { color: var(--coral); }
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
  `],
  template: `
    <nav class="navbar">
      <a class="logo" routerLink="/blog/posts">
        <svg width="34" height="34" viewBox="0 0 120 120" fill="none">
          <circle cx="54" cy="50" r="36" stroke="var(--green)" stroke-width="5.5"/>
          <ellipse cx="44" cy="40" rx="10" ry="13" fill="var(--green)" transform="rotate(-15 44 40)"/>
          <ellipse cx="62" cy="37" rx="8"  ry="10" fill="var(--green)" transform="rotate(10 62 37)"/>
          <ellipse cx="35" cy="56" rx="7"  ry="9"  fill="var(--green)" transform="rotate(-5 35 56)"/>
          <ellipse cx="64" cy="55" rx="6"  ry="7"  fill="var(--green)" transform="rotate(5 64 55)"/>
          <path d="M18 50 Q54 64 90 50" stroke="var(--bg)" stroke-width="2.5" fill="none"/>
          <path d="M38 85 Q54 93 70 85" stroke="var(--green)" stroke-width="5.5" fill="none" stroke-linecap="round"/>
          <line x1="54" y1="86" x2="54" y2="103" stroke="var(--green)" stroke-width="5.5" stroke-linecap="round"/>
          <line x1="38" y1="103" x2="70" y2="103" stroke="var(--green)" stroke-width="5.5" stroke-linecap="round"/>
        </svg>
        <div class="wordmark">
          <span class="wordmark-top">Momento</span>
          <span class="wordmark-main">Curioso</span>
          <span class="wordmark-tag">Admin</span>
        </div>
      </a>
      <div class="nav-right">
        <a class="nav-link" routerLink="/admin/topics"  routerLinkActive="active">Tópicos</a>
        <a class="nav-link" routerLink="/admin/posts"   routerLinkActive="active">Posts</a>
        <a class="nav-link" routerLink="/admin/jobs"    routerLinkActive="active">Jobs</a>
        <a class="nav-link" routerLink="/admin/trigger"   routerLinkActive="active">Trigger</a>
        <a class="nav-link" routerLink="/admin/providers" routerLinkActive="active">Providers</a>
        <a class="nav-link" routerLink="/admin/scraped-articles" routerLinkActive="active">Artigos Raspados</a>
        <a class="nav-link" routerLink="/admin/ai-writer" routerLinkActive="active">IA Redatora</a>
        <button class="theme-toggle" (click)="theme.toggle()">
          {{ theme.isDark() ? '☀ Claro' : '☾ Escuro' }}
        </button>
        <button class="nav-logout" (click)="logout()">Sair</button>
      </div>
    </nav>
  `
})
export class AdminNavbarComponent {
  protected theme = inject(ThemeService);
  private auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
