import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LogoMarkComponent } from '../logo-mark/logo-mark.component';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LogoMarkComponent],
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

    .nav-badge {
      display: inline-block; min-width: 16px;
      padding: 1px 5px; margin-left: 4px;
      border-radius: 10px;
      background: var(--amber); color: #fff;
      font-family: var(--fu); font-size: 10px; font-weight: 700;
      line-height: 14px; text-align: center; vertical-align: middle;
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
        <app-logo-mark />
        <div class="wordmark">
          <span class="wordmark-top">Momento</span>
          <span class="wordmark-main">Curioso</span>
          <span class="wordmark-tag">Admin</span>
        </div>
      </a>
      <div class="nav-right">
        <a class="nav-link" routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
        <a class="nav-link" routerLink="/admin/topics"  routerLinkActive="active">Tópicos</a>
        <a class="nav-link" routerLink="/admin/posts"   routerLinkActive="active">Posts</a>
        <a class="nav-link" routerLink="/admin/jobs"    routerLinkActive="active">Jobs</a>
        <a class="nav-link" routerLink="/admin/trigger"   routerLinkActive="active">Trigger</a>
        <a class="nav-link" routerLink="/admin/providers" routerLinkActive="active">Providers</a>
        <a class="nav-link" routerLink="/admin/scraped-articles" routerLinkActive="active">
          Artigos Raspados
          @if (pending() > 0 && !onArticlesPage()) {
            <span class="nav-badge">{{ pending() }}</span>
          }
        </a>
        <a class="nav-link" routerLink="/admin/ai-writer" routerLinkActive="active">IA Redatora</a>
        <a class="nav-link" routerLink="/admin/prompt-templates" routerLinkActive="active">Prompts</a>
        <a class="nav-link" routerLink="/admin/social-links" routerLinkActive="active">Redes</a>
        <a class="nav-link" routerLink="/admin/users" routerLinkActive="active">Usuários</a>
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
  private notifications = inject(NotificationService);

  protected pending = signal(0);
  protected onArticlesPage = signal(this.router.url.startsWith('/admin/scraped-articles'));

  constructor() {
    this.notifications.pollCounts()
      .pipe(takeUntilDestroyed())
      .subscribe(counts => this.pending.set(counts.pendingApproval));

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(event =>
        this.onArticlesPage.set(event.urlAfterRedirects.startsWith('/admin/scraped-articles'))
      );
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
