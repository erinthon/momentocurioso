import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface AuthResponse {
  token: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', { email, password }).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string {
    return this.claim('role');
  }

  /** Email do usuário logado (claim `sub` do JWT). */
  getEmail(): string {
    return this.claim('sub');
  }

  private claim(name: 'role' | 'sub'): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const base64url = token.split('.')[1];
      const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return payload[name] ?? '';
    } catch {
      return '';
    }
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
}
