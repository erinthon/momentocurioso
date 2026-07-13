import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  private readonly siteUrl = environment.siteUrl;
  private readonly siteName = 'Momento Curioso';
  private readonly defaultDescription = 'Conteúdo curioso e fascinante sobre ciência, tecnologia, natureza e mais.';

  setPost(post: { title: string; summary: string; slug: string }): void {
    const url = `${this.siteUrl}/blog/posts/${post.slug}`;
    this.title.setTitle(`${post.title} – ${this.siteName}`);
    this.meta.updateTag({ name: 'description', content: post.summary });
    this.meta.updateTag({ property: 'og:title', content: post.title });
    this.meta.updateTag({ property: 'og:description', content: post.summary });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.setCanonical(url);
  }

  setList(topicName?: string): void {
    const pageTitle = topicName ? `${topicName} – ${this.siteName}` : this.siteName;
    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: this.defaultDescription });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: this.defaultDescription });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: `${this.siteUrl}/blog/posts` });
    this.setCanonical(`${this.siteUrl}/blog/posts`);
  }

  setPage(page: { title: string; description: string; path: string }): void {
    const url = `${this.siteUrl}${page.path}`;
    this.title.setTitle(`${page.title} – ${this.siteName}`);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.setCanonical(url);
  }

  reset(): void {
    this.title.setTitle(this.siteName);
    this.meta.updateTag({ name: 'description', content: this.defaultDescription });
    this.meta.updateTag({ property: 'og:title', content: this.siteName });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.removeCanonical();
  }

  private setCanonical(url: string): void {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private removeCanonical(): void {
    document.querySelector('link[rel="canonical"]')?.remove();
  }
}
