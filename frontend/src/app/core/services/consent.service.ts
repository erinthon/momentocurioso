import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { BrowserStorageService } from './browser-storage.service';

export type ConsentStatus = 'pending' | 'granted' | 'denied';

const STORAGE_KEY = 'mc-cookie-consent';

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(BrowserStorageService);
  private readonly state = signal<ConsentStatus>(this.readStored());
  readonly status = this.state.asReadonly();

  // Permite que o rodapé e a página de privacidade tragam o banner de volta
  private readonly reopenState = signal(false);
  readonly reopened = this.reopenState.asReadonly();

  grant(): void {
    this.persist('granted');
  }

  deny(): void {
    const wasGranted = this.state() === 'granted';
    this.persist('denied');
    // Scripts de terceiros já injetados não têm unload — recarrega
    // para a revogação valer imediatamente
    if (wasGranted) {
      this.document.defaultView?.location.reload();
    }
  }

  reopen(): void {
    this.reopenState.set(true);
  }

  private persist(status: ConsentStatus): void {
    this.storage.setItem(STORAGE_KEY, status);
    this.reopenState.set(false);
    this.state.set(status);
  }

  private readStored(): ConsentStatus {
    const stored = this.storage.getItem(STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : 'pending';
  }
}
