import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NewsletterSignupComponent } from './newsletter-signup.component';

const BASE_URL = 'http://localhost:8080/api';
const SUBSCRIBED_KEY = 'mc_newsletter_subscribed';

describe('NewsletterSignupComponent', () => {
  let fixture: ComponentFixture<NewsletterSignupComponent>;
  let component: NewsletterSignupComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.removeItem(SUBSCRIBED_KEY);
    await TestBed.configureTestingModule({
      imports: [NewsletterSignupComponent, HttpClientTestingModule],
      providers: [provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(NewsletterSignupComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(SUBSCRIBED_KEY);
    httpMock.verify();
  });

  it('keeps the form hidden until the newsletter button is clicked', () => {
    expect(fixture.nativeElement.querySelector('form')).toBeNull();

    fixture.nativeElement.querySelector('.toggle').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
  });

  it('remembers an accepted subscription and shows the notice', () => {
    component.toggleForm();
    component.email = 'leitor@example.com';
    component.consent = true;
    component.subscribe();
    httpMock.expectOne(`${BASE_URL}/newsletter/subscriptions`).flush({ message: 'Solicitação recebida.' });
    fixture.detectChanges();

    expect(component.isExpanded).toBeFalse();
    expect(localStorage.getItem(SUBSCRIBED_KEY)).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Você já enviou seu cadastro neste navegador.');
  });
});
