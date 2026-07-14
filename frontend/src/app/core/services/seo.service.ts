import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

interface PostSeoData {
  title: string;
  summary: string;
  slug: string;
  thumbnail?: string;
  publishedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  private readonly siteUrl = environment.siteUrl;
  private readonly siteName = 'Momento Curioso';
  private readonly defaultDescription = 'Conteúdo curioso e fascinante sobre ciência, tecnologia, natureza e mais.';
  private readonly structuredDataId = 'page-structured-data';

  setPost(post: PostSeoData): void {
    const url = `${this.siteUrl}/blog/posts/${post.slug}`;
    const imageUrl = post.thumbnail
      ? `${this.siteUrl}/api/posts/${encodeURIComponent(post.slug)}/thumbnail`
      : null;

    this.setCommon(`${post.title} | ${this.siteName}`, post.summary, url, 'article');
    this.meta.updateTag({ property: 'og:title', content: post.title });
    this.meta.updateTag({ name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: post.title });
    this.meta.updateTag({ name: 'twitter:description', content: post.summary });

    if (post.publishedAt) {
      this.meta.updateTag({ property: 'article:published_time', content: post.publishedAt });
    } else {
      this.meta.removeTag('property="article:published_time"');
    }

    this.setSocialImage(imageUrl, post.title);
    this.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.summary,
      mainEntityOfPage: url,
      ...(imageUrl ? { image: imageUrl } : {}),
      ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        url: this.siteUrl
      }
    });
  }

  setList(topicName?: string): void {
    const pageTitle = topicName ? `${topicName} | ${this.siteName}` : this.siteName;
    const url = `${this.siteUrl}/blog/posts`;
    this.setCommon(pageTitle, this.defaultDescription, url, 'website');
    this.setTwitterSummary(pageTitle, this.defaultDescription);
    this.clearPageSpecificMetadata();
  }

  setPage(page: { title: string; description: string; path: string }): void {
    const url = `${this.siteUrl}${page.path}`;
    const pageTitle = `${page.title} | ${this.siteName}`;
    this.setCommon(pageTitle, page.description, url, 'website');
    this.setTwitterSummary(page.title, page.description);
    this.clearPageSpecificMetadata();
  }

  reset(): void {
    this.title.setTitle(this.siteName);
    this.meta.updateTag({ name: 'description', content: this.defaultDescription });
    this.meta.updateTag({ property: 'og:title', content: this.siteName });
    this.meta.updateTag({ property: 'og:description', content: this.defaultDescription });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.removeTag('property="og:url"');
    this.setTwitterSummary(this.siteName, this.defaultDescription);
    this.clearPageSpecificMetadata();
    this.removeCanonical();
  }

  private setCommon(title: string, description: string, url: string, type: 'article' | 'website'): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.setCanonical(url);
  }

  private setTwitterSummary(title: string, description: string): void {
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }

  private setSocialImage(imageUrl: string | null, alt: string): void {
    if (!imageUrl) {
      this.meta.removeTag('property="og:image"');
      this.meta.removeTag('property="og:image:alt"');
      this.meta.removeTag('name="twitter:image"');
      this.meta.removeTag('name="twitter:image:alt"');
      return;
    }

    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:image:alt', content: alt });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:image:alt', content: alt });
  }

  private clearPageSpecificMetadata(): void {
    this.setSocialImage(null, '');
    this.meta.removeTag('property="article:published_time"');
    this.removeStructuredData();
  }

  private setStructuredData(value: object): void {
    let script = this.document.getElementById(this.structuredDataId) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.id = this.structuredDataId;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(value).replace(/</g, '\\u003c');
  }

  private removeStructuredData(): void {
    this.document.getElementById(this.structuredDataId)?.remove();
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private removeCanonical(): void {
    this.document.querySelector('link[rel="canonical"]')?.remove();
  }
}
