import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PromptTemplate {
  id: number;
  name: string;
  template: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PromptTemplateService {
  private api = inject(ApiService);

  findAll(): Observable<PromptTemplate[]> {
    return this.api.get<PromptTemplate[]>('/admin/prompt-templates');
  }

  create(body: { name: string; template: string }): Observable<PromptTemplate> {
    return this.api.post<PromptTemplate>('/admin/prompt-templates', body);
  }

  update(id: number, body: { name: string; template: string }): Observable<PromptTemplate> {
    return this.api.put<PromptTemplate>(`/admin/prompt-templates/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/admin/prompt-templates/${id}`);
  }

  setDefault(id: number): Observable<PromptTemplate> {
    return this.api.patch<PromptTemplate>(`/admin/prompt-templates/${id}/default`, {});
  }
}
