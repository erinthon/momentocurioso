import { Routes } from '@angular/router';

export const NEWSLETTER_ROUTES: Routes = [
  {
    path: 'confirm',
    loadComponent: () => import('./newsletter-action.component').then(m => m.NewsletterActionComponent),
    data: { action: 'confirm' }
  },
  {
    path: 'unsubscribe',
    loadComponent: () => import('./newsletter-action.component').then(m => m.NewsletterActionComponent),
    data: { action: 'unsubscribe' }
  }
];
