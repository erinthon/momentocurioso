import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoMarkComponent } from '../logo-mark/logo-mark.component';
import { SocialLinksComponent } from '../social-links/social-links.component';

@Component({
  selector: 'app-blog-footer',
  standalone: true,
  imports: [RouterLink, LogoMarkComponent, SocialLinksComponent],
  styles: [`
    :host { display: block; }

    .site-footer {
      margin-top: 80px;
      padding: 40px 2rem;
      border-top: 1px solid var(--border);
      background: var(--bg-1);
    }
    .footer-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }

    .footer-brand {
      --logo-size: 30px;
      display: flex; align-items: center; gap: 10px;
      text-decoration: none;
    }
    .footer-brand-name {
      font-family: var(--fd); font-weight: 800; font-size: 15px;
      color: var(--green); letter-spacing: -.3px;
    }

    .footer-copy {
      font-family: var(--fu); font-size: 11px; font-weight: 500;
      color: var(--text-4); letter-spacing: .1em; text-transform: uppercase;
    }

    @media (max-width: 700px) {
      .site-footer { padding: 32px 1rem; }
      .footer-inner { flex-direction: column; text-align: center; }
    }
  `],
  template: `
    <footer class="site-footer">
      <div class="footer-inner">
        <a class="footer-brand" routerLink="/blog/posts">
          <app-logo-mark />
          <span class="footer-brand-name">Momento Curioso</span>
        </a>

        <nav class="footer-social" aria-label="Redes sociais">
          <app-social-links />
        </nav>

        <span class="footer-copy">© {{ year }} Momento Curioso · IA Editorial</span>
      </div>
    </footer>
  `
})
export class BlogFooterComponent {
  protected readonly year = new Date().getFullYear();
}
