import { TestBed } from '@angular/core/testing';
import { ConsentService } from './consent.service';

describe('ConsentService', () => {
  beforeEach(() => {
    localStorage.removeItem('mc-cookie-consent');
    TestBed.configureTestingModule({});
  });

  it('começa como pending sem decisão armazenada', () => {
    const service = TestBed.inject(ConsentService);
    expect(service.status()).toBe('pending');
  });

  it('grant persiste a decisão', () => {
    const service = TestBed.inject(ConsentService);
    service.grant();
    expect(service.status()).toBe('granted');
    expect(localStorage.getItem('mc-cookie-consent')).toBe('granted');
  });

  it('deny a partir de pending persiste sem recarregar a página', () => {
    const service = TestBed.inject(ConsentService);
    service.deny();
    expect(service.status()).toBe('denied');
    expect(localStorage.getItem('mc-cookie-consent')).toBe('denied');
  });

  it('restaura decisão armazenada na criação', () => {
    localStorage.setItem('mc-cookie-consent', 'granted');
    const service = TestBed.inject(ConsentService);
    expect(service.status()).toBe('granted');
  });

  it('ignora valor inválido armazenado', () => {
    localStorage.setItem('mc-cookie-consent', 'lixo');
    const service = TestBed.inject(ConsentService);
    expect(service.status()).toBe('pending');
  });
});
