import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BrowserStorageService } from './browser-storage.service';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'mc-theme';
  private readonly doc = inject(DOCUMENT);
  private readonly storage = inject(BrowserStorageService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (this.isBrowser) {
      this.apply(this.saved());
    }
  }

  toggle(): void {
    this.apply(this.current() === 'light' ? 'dark' : 'light');
  }

  current(): Theme {
    return this.doc.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  isDark(): boolean {
    return this.current() === 'dark';
  }

  private apply(theme: Theme): void {
    this.doc.documentElement.setAttribute('data-theme', theme);
    this.storage.setItem(this.STORAGE_KEY, theme);
  }

  private saved(): Theme {
    return this.storage.getItem(this.STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  }
}
