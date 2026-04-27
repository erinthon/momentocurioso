import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PostDetailComponent } from './post-detail.component';

const BASE_URL = 'http://localhost:8080/api';

const MOCK_POST = {
  id: 1,
  title: 'Descoberta Incrível',
  slug: 'descoberta-incrivel',
  summary: 'Resumo do post',
  content: '<p>Parágrafo principal</p><h2>Subtítulo</h2><strong>Negrito</strong>',
  topicSlug: 'ciencia',
  publishedAt: '2026-01-15T10:00:00',
};

describe('PostDetailComponent — BUG-014: XSS via bypassSecurityTrustHtml', () => {
  let fixture: ComponentFixture<PostDetailComponent>;
  let component: PostDetailComponent;
  let httpMock: HttpTestingController;
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (_: string) => 'descoberta-incrivel' },
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PostDetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should render post content via innerHTML binding', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url.includes('/posts/descoberta-incrivel'));
    req.flush(MOCK_POST);

    tick(100);
    fixture.detectChanges();

    expect(component.post).toBeTruthy();
    expect(component.postContent).toBe(MOCK_POST.content);
  }));

  it('should not call bypassSecurityTrustHtml', fakeAsync(() => {
    const spy = spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();

    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url.includes('/posts/'));
    req.flush(MOCK_POST);

    tick(100);
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
  }));

  it('should sanitize script tags in post content (Angular auto-sanitize)', fakeAsync(() => {
    const xssPost = {
      ...MOCK_POST,
      content: `<script>window.__xss_executed = true</script><p>Conteúdo legítimo</p>`,
    };

    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url.includes('/posts/'));
    req.flush(xssPost);

    tick(100);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const scripts = compiled.querySelectorAll('script');
    expect(scripts.length).toBe(0);
    expect((window as any).__xss_executed).toBeUndefined();
  }));

  it('should preserve structural HTML tags (p, h2, strong, em, a)', fakeAsync(() => {
    const structuredPost = {
      ...MOCK_POST,
      content: '<p>Parágrafo</p><h2>Título</h2><strong>Negrito</strong><em>Itálico</em><a href="https://example.com">Link</a>',
    };

    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url.includes('/posts/'));
    req.flush(structuredPost);

    tick(100);
    fixture.detectChanges();

    const article = fixture.nativeElement.querySelector('.article-content');
    if (article) {
      expect(article.querySelector('p')).toBeTruthy();
      expect(article.querySelector('h2')).toBeTruthy();
      expect(article.querySelector('strong')).toBeTruthy();
    }
    // postContent recebe o HTML sem bypass — Angular sanitiza inline
    expect(component.postContent).toContain('<p>Parágrafo</p>');
  }));
});
