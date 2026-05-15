import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DashboardLastJob {
  id: number;
  topicSlug: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  triggeredBy: 'SCHEDULER' | 'MANUAL';
  startedAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
  postId: number | null;
  articlesFound: number | null;
  articlesUsed: number | null;
  summary: string | null;
}

export interface DashboardActiveProvider {
  id: number;
  name: string;
  type: 'CLAUDE' | 'OPENAI' | 'OPENAI_COMPATIBLE';
  model: string;
  baseUrl: string | null;
}

export interface DashboardMetrics {
  postsToday: number;
  pendingArticles: number;
  queuedArticles: number;
  totalPublishedPosts: number;
  lastJob: DashboardLastJob | null;
  activeProvider: DashboardActiveProvider | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);

  getMetrics(): Observable<DashboardMetrics> {
    return this.api.get<DashboardMetrics>('/admin/dashboard');
  }
}
