import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialLink, SocialLinkService, SocialPlatform } from '../../core/services/social-link.service';

/** Ícone de cada rede (paths de 24×24). As URLs vêm da API; só o desenho é fixo. */
const ICONS: Record<SocialPlatform, string> = {
  YOUTUBE: 'M23.5 6.2a3 3 0 0 0-2.12-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.52A3 3 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3 3 0 0 0 2.12 2.13c1.88.52 9.38.52 9.38.52s7.5 0 9.38-.52A3 3 0 0 0 23.5 17.8C24 15.93 24 12 24 12s0-3.93-.5-5.8ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z',
  INSTAGRAM: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z',
  X: 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.63 7.58H.47l8.6-9.83L0 1.15h7.59l5.25 6.93 6.07-6.93Zm-1.29 19.49h2.04L6.49 3.24H4.3l13.31 17.4Z',
  TIKTOK: 'M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z',
  FACEBOOK: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z',
  LINKEDIN: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z'
};

const LABELS: Record<SocialPlatform, string> = {
  YOUTUBE: 'YouTube',
  INSTAGRAM: 'Instagram',
  X: 'X',
  TIKTOK: 'TikTok',
  FACEBOOK: 'Facebook',
  LINKEDIN: 'LinkedIn'
};

/**
 * Ícones das redes (vindas da API) + RSS. O pai ajusta o layout por custom
 * properties: --social-size, --social-gap, --social-border e
 * --social-brand-display (none esconde as redes, preservando o RSS).
 */
@Component({
  selector: 'app-social-links',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: flex; align-items: center;
      gap: var(--social-gap, 8px);
    }
    .social-link {
      display: var(--social-brand-display, flex);
      align-items: center; justify-content: center;
      width: var(--social-size, 34px); height: var(--social-size, 34px);
      border-radius: 50%;
      border: var(--social-border, 1px solid var(--border));
      color: var(--text-3);
      transition: color var(--t), border-color var(--t);
      &:hover { color: var(--green); border-color: var(--green); }
      svg { display: block; }
    }
    .rss { display: flex; }
  `],
  template: `
    <a *ngFor="let link of links" class="social-link" [href]="link.url"
       target="_blank" rel="noopener noreferrer"
       [title]="labelOf(link)" [attr.aria-label]="labelOf(link)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path [attr.d]="iconOf(link)"/>
      </svg>
    </a>

    <a class="social-link rss" href="/api/feed.xml"
       target="_blank" rel="noopener noreferrer" title="Feed RSS" aria-label="Feed RSS">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <circle cx="3" cy="13" r="2"/>
        <path d="M1 6.5a.5.5 0 0 1 .5-.5C7.3 6 10 8.7 10 14.5a.5.5 0 0 1-1 0C9 9.25 6.75 7 1.5 7a.5.5 0 0 1-.5-.5Z"/>
        <path d="M1 2.5a.5.5 0 0 1 .5-.5C9.6 2 14 6.4 14 14.5a.5.5 0 0 1-1 0C13 7 9 3 1.5 3a.5.5 0 0 1-.5-.5Z"/>
      </svg>
    </a>
  `
})
export class SocialLinksComponent implements OnInit {
  private socialLinks = inject(SocialLinkService);

  links: SocialLink[] = [];

  ngOnInit(): void {
    this.socialLinks.getActive().subscribe({
      next: links => this.links = links.filter(l => ICONS[l.platform]),
      error: () => this.links = []
    });
  }

  iconOf(link: SocialLink): string {
    return ICONS[link.platform];
  }

  labelOf(link: SocialLink): string {
    return LABELS[link.platform];
  }
}
