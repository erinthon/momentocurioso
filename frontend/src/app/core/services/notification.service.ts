import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, interval } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface NotificationCounts {
  pendingApproval: number;
  queued: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = inject(ApiService);

  getCounts(): Observable<NotificationCounts> {
    return this.api.get<NotificationCounts>('/admin/notifications/counts');
  }

  /** Emite as contagens imediatamente e a cada 30s; erros de rede não encerram o polling. */
  pollCounts(): Observable<NotificationCounts> {
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getCounts().pipe(catchError(() => EMPTY)))
    );
  }
}
