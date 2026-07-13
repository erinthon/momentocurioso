import { Injectable, signal } from '@angular/core';

export type ConsentStatus = 'pending' | 'granted' | 'denied';

const STORAGE_KEY = 'mc-cookie-consent';

@Injectable({ providedIn: 'root' })
export class ConsentService {
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
      document.location.reload();
    }
  }

  reopen(): void {
    this.reopenState.set(true);
  }

  private persist(status: ConsentStatus): void {
    localStorage.setItem(STORAGE_KEY, status);
    this.reopenState.set(false);
    this.state.set(status);
  }

  private readStored(): ConsentStatus {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : 'pending';
  }
}
