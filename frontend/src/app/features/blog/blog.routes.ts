import { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
  {
    path: 'posts',
    loadComponent: () =>
      import('./post-list/post-list.component').then(m => m.PostListComponent)
  },
  {
    path: 'posts/:slug',
    loadComponent: () =>
      import('./post-detail/post-detail.component').then(m => m.PostDetailComponent)
  },
  { path: '', redirectTo: 'posts', pathMatch: 'full' }
];
