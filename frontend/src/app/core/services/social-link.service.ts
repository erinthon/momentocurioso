import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from './api.service';

export type SocialPlatform = 'YOUTUBE' | 'INSTAGRAM' | 'X' | 'TIKTOK' | 'FACEBOOK' | 'LINKEDIN';

export interface SocialLink {
  id: number;
  platform: SocialPlatform;
  url: string;
  active: boolean;
  displayOrder: number;
}

@Injectable({ providedIn: 'root' })
export class SocialLinkService {
  private api = inject(ApiService);

  /** Navbar e footer aparecem juntos na mesma página — uma requisição serve os dois. */
  private active$?: Observable<SocialLink[]>;

  getActive(): Observable<SocialLink[]> {
    if (!this.active$) {
      this.active$ = this.api.get<SocialLink[]>('/social-links').pipe(shareReplay(1));
    }
    return this.active$;
  }

  /** Descarta o cache depois de uma edição no admin. */
  invalidate(): void {
    this.active$ = undefined;
  }
}
