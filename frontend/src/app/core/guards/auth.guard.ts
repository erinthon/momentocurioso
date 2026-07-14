import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BrowserStorageService } from '../services/browser-storage.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = inject(BrowserStorageService).getItem('token');
  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }
  return true;
};
