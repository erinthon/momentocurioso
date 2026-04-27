import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PostListComponent } from './post-list.component';

const BASE_URL = 'http://localhost:8080/api';

const MOCK_POSTS_PAGE = {
  content: [
    { id: 1, title: 'Post 1', slug: 'post-1', summary: 'Sum 1', topicSlug: 'tech', publishedAt: '2026-01-01T00:00:00' },
    { id: 2, title: 'Post 2', slug: 'post-2', summary: 'Sum 2', topicSlug: 'tech', publishedAt: '2026-01-02T00:00:00' },
  ],
  totalElements: 2,
  totalPages: 1,
  last: true,
};

const EMPTY_PAGE = { content: [], totalElements: 0, totalPages: 0, last: true };

const MOCK_TOPICS = [
  { id: 1, name: 'Tecnologia', slug: 'tech', active: true },
];

describe('PostListComponent — BUG-011: forkJoin resiliente', () => {
  let fixture: ComponentFixture<PostListComponent>;
  let component: PostListComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostListComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PostListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should display posts when only topics request fails', fakeAsync(() => {
    fixture.detectChanges();

    const topicsReq = httpMock.expectOne((req) => req.url.includes('/topics'));
    const postsReq = httpMock.expectOne((req) => req.url.includes('/posts'));

    topicsReq.error(new ProgressEvent('error'));
    postsReq.flush(MOCK_POSTS_PAGE);

    tick(100);
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.posts.length).toBe(2);
    expect(component.topics.length).toBe(0);
  }));

  it('should show empty state when only posts request fails', fakeAsync(() => {
    fixture.detectChanges();

    const topicsReq = httpMock.expectOne((req) => req.url.includes('/topics'));
    const postsReq = httpMock.expectOne((req) => req.url.includes('/posts'));

    topicsReq.flush(MOCK_TOPICS);
    postsReq.error(new ProgressEvent('error'));

    tick(100);
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.posts.length).toBe(0);
  }));

  it('should set loading false when both requests fail', fakeAsync(() => {
    fixture.detectChanges();

    const topicsReq = httpMock.expectOne((req) => req.url.includes('/topics'));
    const postsReq = httpMock.expectOne((req) => req.url.includes('/posts'));

    topicsReq.error(new ProgressEvent('error'));
    postsReq.error(new ProgressEvent('error'));

    tick(100);
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.posts.length).toBe(0);
    expect(component.topics.length).toBe(0);
  }));

  it('should display posts and topic filters when both requests succeed', fakeAsync(() => {
    fixture.detectChanges();

    const topicsReq = httpMock.expectOne((req) => req.url.includes('/topics'));
    const postsReq = httpMock.expectOne((req) => req.url.includes('/posts'));

    topicsReq.flush(MOCK_TOPICS);
    postsReq.flush(MOCK_POSTS_PAGE);

    tick(100);
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.posts.length).toBe(2);
    expect(component.topics.length).toBe(1);
    expect(component.totalElements).toBe(2);
  }));

  it('should set loading false after any combination of success or failure', fakeAsync(() => {
    fixture.detectChanges();

    expect(component.loading).toBeTrue();

    const topicsReq = httpMock.expectOne((req) => req.url.includes('/topics'));
    const postsReq = httpMock.expectOne((req) => req.url.includes('/posts'));

    topicsReq.flush([]);
    postsReq.flush(EMPTY_PAGE);

    tick(100);

    expect(component.loading).toBeFalse();
  }));
});
