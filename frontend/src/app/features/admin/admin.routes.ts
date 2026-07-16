import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
  },
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
  {
    path: 'ai-writer',
    loadComponent: () =>
      import('./ai-writer/ai-writer.component').then(m => m.AdminAiWriterComponent)
  },
  {
    path: 'prompt-templates',
    loadComponent: () =>
      import('./prompt-templates/prompt-templates.component').then(m => m.AdminPromptTemplatesComponent)
  },
  {
    path: 'social-links',
    loadComponent: () =>
      import('./social-links/social-links.component').then(m => m.AdminSocialLinksComponent)
  },
  {
    path: 'newsletter',
    loadComponent: () =>
      import('./newsletter/newsletter.component').then(m => m.AdminNewsletterComponent)
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/users.component').then(m => m.AdminUsersComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
