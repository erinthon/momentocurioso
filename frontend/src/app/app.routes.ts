import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'blog/posts',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'blog',
    loadChildren: () => import('./features/blog/blog.routes').then(m => m.BLOG_ROUTES)
  },
  {
    path: 'newsletter',
    loadChildren: () => import('./features/newsletter/newsletter.routes').then(m => m.NEWSLETTER_ROUTES)
  },
  // URLs legadas divulgadas no X antes da correcao do script; os tweets ja
  // publicados nao podem ser editados, entao o redirect precisa ficar.
  {
    path: 'posts/:slug',
    redirectTo: 'blog/posts/:slug'
  },
  {
    path: 'posts',
    redirectTo: 'blog/posts',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./features/legal/legal.routes').then(m => m.LEGAL_ROUTES)
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [adminGuard]
  },
  {
    path: '**',
    redirectTo: 'blog/posts'
  }
];
