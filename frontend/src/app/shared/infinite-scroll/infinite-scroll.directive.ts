import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, AfterViewInit, Output, PLATFORM_ID, SimpleChanges, inject } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input() disabled = false;
  @Output() scrolled = new EventEmitter<void>();

  private observer?: IntersectionObserver;
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !('IntersectionObserver' in window)) return;
    this.observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !this.disabled) this.scrolled.emit(); },
      { rootMargin: '200px', threshold: 0 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled'] && !this.disabled && this.observer) {
      this.observer.unobserve(this.el.nativeElement);
      this.observer.observe(this.el.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
