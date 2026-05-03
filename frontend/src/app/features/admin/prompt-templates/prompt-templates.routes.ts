import { Routes } from '@angular/router';

export const PROMPT_TEMPLATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./prompt-templates.component').then(m => m.AdminPromptTemplatesComponent)
  }
];
