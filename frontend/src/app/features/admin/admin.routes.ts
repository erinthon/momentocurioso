import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'topics',
    loadComponent: () =>
      import('./topics/topics.component').then(m => m.AdminTopicsComponent)
  },
  {
    path: 'posts',
    loadComponent: () =>
      import('./posts/posts.component').then(m => m.AdminPostsComponent)
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./jobs/jobs.component').then(m => m.AdminJobsComponent)
  },
  {
    path: 'trigger',
    loadComponent: () =>
      import('./trigger/trigger.component').then(m => m.AdminTriggerComponent)
  },
  {
    path: 'providers',
    loadComponent: () =>
      import('./providers/providers.component').then(m => m.AdminProvidersComponent)
  },
  {
    path: 'scraped-articles',
    loadComponent: () =>
      import('./scraped-articles/scraped-articles.component').then(m => m.AdminScrapedArticlesComponent)
  },
  { path: '', redirectTo: 'topics', pathMatch: 'full' }
];
