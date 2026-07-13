import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogNavbarComponent } from '../../../shared/blog-navbar/blog-navbar.component';
import { BlogFooterComponent } from '../../../shared/blog-footer/blog-footer.component';

@Component({
  selector: 'app-legal-shell',
  standalone: true,
  imports: [RouterLink, BlogNavbarComponent, BlogFooterComponent],
  styles: [`
    .legal-hero {
      position: relative;
      border-bottom: 1px solid var(--border);
      padding: 64px 2rem 48px;
      background: var(--bg-1);
      overflow: hidden;
    }
    .legal-hero::before {
      content: '';
      position: absolute;
      top: -100px;
      right: -60px;
      width: 420px;
      height: 420px;
      background: radial-gradient(circle, rgba(10,124,56,.10) 0%, transparent 65%);
      pointer-events: none;
    }
    .hero-inner {
      position: relative;
      max-width: 680px;
      margin: 0 auto;
    }
    .breadcrumb-back {
      display: inline-block;
      margin-bottom: 28px;
      font-family: var(--fu);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: .06em;
      color: var(--text-3);
      text-decoration: none;
      transition: color var(--t);
      &:hover { color: var(--green); }
    }
    .hero-title {
      font-family: var(--fd);
      font-weight: 800;
      font-size: clamp(30px, 4.5vw, 44px);
      color: var(--text);
      letter-spacing: -1.6px;
      line-height: 1.1;
      margin-bottom: 20px;
    }
    .hero-updated {
      padding-top: 18px;
      border-top: 1px solid var(--border);
      font-family: var(--fu);
      font-size: 11px;
      font-weight: 500;
      color: var(--text-4);
      letter-spacing: .06em;
    }

    .legal-wrapper {
      max-width: 680px;
      margin: 0 auto;
      padding: 56px 2rem 100px;
    }

    /* Tipografia de leitura, alinhada ao corpo do post */
    .legal-body {
      font-family: var(--fb);
      font-size: 17px;
      color: var(--text-2);
      line-height: 1.8;

      ::ng-deep h2 {
        font-family: var(--fd);
        font-weight: 800;
        font-size: 24px;
        color: var(--text);
        letter-spacing: -.7px;
        line-height: 1.2;
        margin: 2.2em 0 .7em;
      }
      ::ng-deep h2:first-child { margin-top: 0; }

      ::ng-deep p { margin: 0 0 1.4em; }
      ::ng-deep strong { color: var(--text); font-weight: 700; }

      ::ng-deep ul { margin: 0 0 1.4em; padding-left: 1.5em; }
      ::ng-deep li { margin-bottom: .5em; }

      ::ng-deep a {
        color: var(--green);
        text-decoration: none;
        border-bottom: 1px solid rgba(10,124,56,.25);
        transition: border-color var(--t);
        &:hover { border-color: var(--green); }
      }

      ::ng-deep .callout {
        margin: 2em 0;
        padding: 20px 24px;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-left: 3px solid var(--green);
        border-radius: 0 var(--r) var(--r) 0;
        font-size: 16px;
        color: var(--text-3);
      }
      ::ng-deep .callout p:last-child { margin-bottom: 0; }
    }

    @media (max-width: 600px) {
      .legal-hero { padding: 48px 1rem 36px; }
      .legal-wrapper { padding: 40px 1rem 72px; }
    }
  `],
  template: `
    <app-blog-navbar />

    <header class="legal-hero">
      <div class="hero-inner">
        <a class="breadcrumb-back" routerLink="/blog/posts">← Blog</a>
        <h1 class="hero-title">{{ title }}</h1>
        <p class="hero-updated">Última atualização: {{ updatedAt }}</p>
      </div>
    </header>

    <div class="legal-wrapper">
      <div class="legal-body">
        <ng-content />
      </div>
    </div>

    <app-blog-footer />
  `
})
export class LegalShellComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) updatedAt!: string;
}
