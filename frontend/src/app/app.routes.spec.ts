import { TestBed } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { Router, provideRouter } from '@angular/router';

import { routes } from './app.routes';

describe('app.routes — URLs legadas /posts', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideLocationMocks()],
    });

    router = TestBed.inject(Router);
  });

  it('redireciona /posts/:slug para /blog/posts/:slug preservando o slug', async () => {
    await router.navigateByUrl('/posts/a-falta-que-humilhou-um-goleiro-em-paris');

    expect(router.url).toBe('/blog/posts/a-falta-que-humilhou-um-goleiro-em-paris');
  });

  it('redireciona /posts para a lista em /blog/posts', async () => {
    await router.navigateByUrl('/posts');

    expect(router.url).toBe('/blog/posts');
  });

  it('mantem /blog/posts/:slug como rota canonica', async () => {
    await router.navigateByUrl('/blog/posts/descoberta-incrivel');

    expect(router.url).toBe('/blog/posts/descoberta-incrivel');
  });

  it('nao intercepta as rotas legais', async () => {
    await router.navigateByUrl('/privacidade');

    expect(router.url).toBe('/privacidade');
  });
});
