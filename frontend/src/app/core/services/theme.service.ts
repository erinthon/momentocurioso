import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'mc-theme';
  private readonly doc = inject(DOCUMENT);

  constructor() {
    this.apply(this.saved());
  }

  toggle(): void {
    this.apply(this.current() === 'light' ? 'dark' : 'light');
  }

  current(): Theme {
    return (this.doc.documentElement.dataset['theme'] as Theme) ?? 'light';
  }

  isDark(): boolean {
    return this.current() === 'dark';
  }

  private apply(theme: Theme): void {
    this.doc.documentElement.dataset['theme'] = theme;
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  private saved(): Theme {
    return localStorage.getItem(this.STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  }
}
