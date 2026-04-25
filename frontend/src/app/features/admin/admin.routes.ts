import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'topics',
    loadComponent: () =>
      import('./topics/topics.component').then(m => m.AdminTopicsComponent)
  },
  { path: '', redirectTo: 'topics', pathMatch: 'full' }
];
