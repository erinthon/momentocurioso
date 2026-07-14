import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'blog/posts',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'privacidade',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'termos',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
