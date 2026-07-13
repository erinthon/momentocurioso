import { Routes } from '@angular/router';

export const LEGAL_ROUTES: Routes = [
  {
    path: 'privacidade',
    loadComponent: () =>
      import('./privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'termos',
    loadComponent: () =>
      import('./terms/terms.component').then(m => m.TermsComponent)
  }
];
