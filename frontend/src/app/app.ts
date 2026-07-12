import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { AnalyticsService } from './core/services/analytics.service';
import { AdsenseService } from './core/services/adsense.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor() {
    inject(ThemeService);
    inject(AnalyticsService).init();
    inject(AdsenseService).init();
  }
}
