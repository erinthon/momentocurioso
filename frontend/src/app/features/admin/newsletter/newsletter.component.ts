import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../../core/services/api.service';
import { AdminNavbarComponent } from '../../../shared/admin-navbar/admin-navbar.component';

interface PostSummary { id: number; title: string; }
interface PageResponse<T> { content: T[]; totalElements: number; }
interface NewsletterSubscriber {
  id: number; email: string; name?: string;
  status: 'PENDING' | 'ACTIVE' | 'UNSUBSCRIBED'; subscribedAt: string;
}
interface NewsletterIssue {
  id: number; subject: string; preheader: string; mainPostId: number; mainPostTitle: string;
  quickFactOne: string; quickFactTwo: string; quickFactThree: string;
  videoTitle?: string; videoUrl?: string; recommendationTitle?: string; recommendationUrl?: string;
  communityQuestion: string; status: 'DRAFT' | 'SENT'; sentCount: number; failedCount: number;
  sentAt?: string; createdAt: string;
}
interface NewsletterIssueForm {
  subject: string; preheader: string; mainPostId: number | null;
  quickFactOne: string; quickFactTwo: string; quickFactThree: string;
  videoTitle: string; videoUrl: string; recommendationTitle: string; recommendationUrl: string;
  communityQuestion: string;
}

@Component({
  selector: 'app-admin-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--bg); }
    .page { max-width: 1180px; margin: 0 auto; padding: 2.5rem 2rem 5rem; }
    .header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 28px; }
    .eyebrow { font-family: var(--fu); font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--text-3); }
    h1 { margin: 6px 0 0; font-family: var(--fd); font-size: 30px; color: var(--text); }
    .audience { padding: 12px 18px; background: var(--green-pale); color: var(--green); border-radius: var(--r); font-family: var(--fu); font-weight: 700; }
    .tabs { display: flex; gap: 8px; margin-bottom: 20px; }
    .tab { padding: 8px 16px; border: 1px solid var(--border); border-radius: 40px; background: var(--bg-1); color: var(--text-3); cursor: pointer; font-family: var(--fu); font-size: 12px; font-weight: 700; }
    .tab.active { background: var(--green); color: #fff; border-color: var(--green); }
    .panel { background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--rl); padding: 24px; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; }
    h2 { margin: 0; font-family: var(--fd); font-size: 20px; color: var(--text); }
    .btn { padding: 8px 15px; border-radius: var(--r); border: 1px solid var(--border); background: transparent; color: var(--text-2); cursor: pointer; font-family: var(--fu); font-size: 12px; font-weight: 700; }
    .btn:hover { border-color: var(--green); color: var(--green); }
    .btn-primary { background: var(--green); border-color: var(--green); color: #fff; }
    .btn-danger:hover { border-color: var(--coral); color: var(--coral); }
    .btn:disabled { opacity: .5; cursor: wait; }
    .form { margin-bottom: 24px; padding: 22px; border: 1px solid var(--border); border-radius: var(--r); background: var(--bg); }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .full { grid-column: 1 / -1; }
    label { display: flex; flex-direction: column; gap: 6px; font-family: var(--fu); font-size: 11px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: .06em; }
    input, select, textarea { padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--r); background: var(--bg-1); color: var(--text); font-family: var(--fu); font-size: 13px; outline: none; text-transform: none; letter-spacing: 0; }
    textarea { min-height: 72px; resize: vertical; }
    input:focus, select:focus, textarea:focus { border-color: var(--green); }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .error { color: var(--coral); font-family: var(--fu); font-size: 12px; margin: 10px 0; }
    .success { color: var(--green); font-family: var(--fu); font-size: 12px; margin: 10px 0; }
    .list { display: grid; gap: 12px; }
    .issue { padding: 18px; border: 1px solid var(--border); border-radius: var(--r); display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: center; }
    .issue h3 { margin: 0 0 5px; font-family: var(--fd); font-size: 17px; color: var(--text); }
    .meta { font-family: var(--fu); font-size: 11px; color: var(--text-4); }
    .story { margin-top: 8px; font-family: var(--fb); font-size: 13px; color: var(--text-3); }
    .issue-actions { display: flex; gap: 7px; flex-wrap: wrap; justify-content: flex-end; }
    .badge { display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 20px; background: var(--bg-2); color: var(--text-3); font-family: var(--fu); font-size: 10px; }
    .badge.sent { background: var(--green-pale); color: var(--green); }
    .preview-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px; background: rgba(9, 25, 17, .72); }
    .preview-dialog { width: min(900px, 100%); max-height: calc(100vh - 48px); overflow: hidden; border-radius: var(--rl); background: var(--bg-1); box-shadow: 0 24px 80px rgba(0, 0, 0, .35); }
    .preview-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 22px; border-bottom: 1px solid var(--border); }
    .preview-header h2 { font-size: 18px; }
    .preview-inbox { padding: 14px 22px; border-bottom: 1px solid var(--border); background: var(--bg-2); font-family: var(--fu); }
    .preview-inbox strong, .preview-inbox span { display: block; }
    .preview-inbox strong { color: var(--text); font-size: 14px; }
    .preview-inbox span { margin-top: 4px; color: var(--text-3); font-size: 12px; }
    .preview-frame { display: block; width: 100%; height: min(70vh, 720px); border: 0; background: #f4f7f5; }
    .table { border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; }
    .row { display: grid; grid-template-columns: 1.4fr 2fr 120px 130px 80px; align-items: center; min-height: 48px; padding: 0 12px; border-bottom: 1px solid var(--border); }
    .row:last-child { border-bottom: 0; }
    .head { background: var(--bg-2); min-height: 38px; font-family: var(--fu); font-size: 10px; font-weight: 700; color: var(--text-3); text-transform: uppercase; }
    .cell { padding: 8px; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-family: var(--fu); font-size: 12px; color: var(--text-2); }
    .empty { padding: 44px; text-align: center; color: var(--text-3); font-family: var(--fu); font-size: 13px; }
    @media (max-width: 760px) {
      .page { padding: 1.5rem 1rem 4rem; } .grid { grid-template-columns: 1fr; } .full { grid-column: auto; }
      .issue { grid-template-columns: 1fr; } .issue-actions { justify-content: flex-start; }
      .table { overflow-x: auto; } .row { min-width: 760px; }
    }
  `],
  template: `
    <app-admin-navbar />
    <main class="page">
      <header class="header">
        <div><span class="eyebrow">Admin · Audiência própria</span><h1>Newsletter</h1></div>
        <div class="audience">{{ activeCount }} inscritos ativos</div>
      </header>

      <nav class="tabs">
        <button class="tab" [class.active]="tab === 'issues'" (click)="tab = 'issues'">Edições</button>
        <button class="tab" [class.active]="tab === 'subscribers'" (click)="tab = 'subscribers'">Inscritos</button>
      </nav>

      <section class="panel" *ngIf="tab === 'issues'">
        <div class="panel-header"><h2>Dose Semanal de Curiosidade</h2><button class="btn btn-primary" (click)="startCreate()">+ Nova edição</button></div>
        <p class="error" *ngIf="error">{{ error }}</p><p class="success" *ngIf="success">{{ success }}</p>

        <form class="form" *ngIf="showForm" (ngSubmit)="save()">
          <div class="grid">
            <label>Assunto<input name="subject" maxlength="255" [(ngModel)]="form.subject" required /></label>
            <label>Prévia do e-mail<input name="preheader" maxlength="255" [(ngModel)]="form.preheader" required /></label>
            <label class="full">Melhor história da semana
              <select name="mainPostId" [(ngModel)]="form.mainPostId" required><option [ngValue]="null">Selecione um post publicado</option><option *ngFor="let post of posts" [ngValue]="post.id">{{ post.title }}</option></select>
            </label>
            <label>Curiosidade rápida 1<textarea name="fact1" maxlength="500" [(ngModel)]="form.quickFactOne" required></textarea></label>
            <label>Curiosidade rápida 2<textarea name="fact2" maxlength="500" [(ngModel)]="form.quickFactTwo" required></textarea></label>
            <label>Curiosidade rápida 3<textarea name="fact3" maxlength="500" [(ngModel)]="form.quickFactThree" required></textarea></label>
            <label>Pergunta para a comunidade<textarea name="question" maxlength="500" [(ngModel)]="form.communityQuestion" required></textarea></label>
            <label>Título do vídeo<input name="videoTitle" maxlength="255" [(ngModel)]="form.videoTitle" /></label>
            <label>URL HTTPS do vídeo<input name="videoUrl" type="url" maxlength="2048" [(ngModel)]="form.videoUrl" /></label>
            <label>Livro ou produto contextual<input name="recommendationTitle" maxlength="255" [(ngModel)]="form.recommendationTitle" /></label>
            <label>URL HTTPS da recomendação<input name="recommendationUrl" type="url" maxlength="2048" [(ngModel)]="form.recommendationUrl" /></label>
          </div>
          <div class="form-actions"><button type="button" class="btn" (click)="cancel()">Cancelar</button><button class="btn btn-primary" type="submit" [disabled]="saving || !form.mainPostId">{{ saving ? 'Salvando...' : 'Salvar rascunho' }}</button></div>
        </form>

        <div class="list">
          <article class="issue" *ngFor="let issue of issues">
            <div><h3>{{ issue.subject }}<span class="badge" [class.sent]="issue.status === 'SENT'">{{ issue.status === 'SENT' ? 'Enviada' : 'Rascunho' }}</span></h3><div class="meta">Criada em {{ formatDate(issue.createdAt) }}<span *ngIf="issue.sentAt"> · {{ issue.sentCount }} enviados · {{ issue.failedCount }} falhas</span></div><div class="story">História principal: {{ issue.mainPostTitle }}</div></div>
            <div class="issue-actions" *ngIf="issue.status === 'DRAFT'"><button class="btn" (click)="openPreview(issue)" [disabled]="previewLoadingId === issue.id">{{ previewLoadingId === issue.id ? 'Carregando...' : 'Visualizar' }}</button><button class="btn" (click)="edit(issue)">Editar</button><button class="btn btn-danger" (click)="removeIssue(issue)">Excluir</button><button class="btn btn-primary" (click)="send(issue)" [disabled]="sendingId === issue.id">{{ sendingId === issue.id ? 'Enviando...' : 'Enviar agora' }}</button></div>
          </article>
          <div class="empty" *ngIf="!loading && issues.length === 0">Nenhuma edição criada.</div>
        </div>
      </section>

      <section class="panel" *ngIf="tab === 'subscribers'">
        <div class="panel-header"><h2>Lista de inscritos</h2><span class="meta">{{ subscriberTotal }} registros</span></div>
        <div class="table">
          <div class="row head"><span class="cell">Nome</span><span class="cell">E-mail</span><span class="cell">Status</span><span class="cell">Inscrição</span><span class="cell"></span></div>
          <div class="row" *ngFor="let subscriber of subscribers"><span class="cell">{{ subscriber.name || '—' }}</span><span class="cell">{{ subscriber.email }}</span><span class="cell">{{ statusLabel(subscriber.status) }}</span><span class="cell">{{ formatDate(subscriber.subscribedAt) }}</span><span class="cell"><button class="btn btn-danger" (click)="removeSubscriber(subscriber)">Excluir</button></span></div>
          <div class="empty" *ngIf="subscribers.length === 0">Nenhum inscrito encontrado.</div>
        </div>
      </section>
    </main>

    <div class="preview-backdrop" *ngIf="previewHtml" (click)="closePreview()">
      <section class="preview-dialog" role="dialog" aria-modal="true" aria-labelledby="newsletter-preview-title" (click)="$event.stopPropagation()">
        <header class="preview-header"><h2 id="newsletter-preview-title">Prévia da edição</h2><button class="btn" type="button" (click)="closePreview()">Fechar</button></header>
        <div class="preview-inbox"><strong>{{ previewIssue?.subject }}</strong><span>{{ previewIssue?.preheader }}</span></div>
        <iframe class="preview-frame" title="Corpo do e-mail" sandbox [srcdoc]="previewHtml"></iframe>
      </section>
    </div>
  `
})
export class AdminNewsletterComponent implements OnInit {
  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  tab: 'issues' | 'subscribers' = 'issues';
  issues: NewsletterIssue[] = [];
  subscribers: NewsletterSubscriber[] = [];
  posts: PostSummary[] = [];
  activeCount = 0; subscriberTotal = 0; loading = true; saving = false;
  sendingId: number | null = null; showForm = false; editingId: number | null = null;
  previewLoadingId: number | null = null; previewIssue: NewsletterIssue | null = null; previewHtml: SafeHtml | null = null;
  error = ''; success = ''; form = this.emptyForm();

  ngOnInit(): void { this.loadAll(); }
  loadAll(): void {
    this.loadIssues(); this.loadSubscribers();
    this.api.get<PageResponse<PostSummary>>('/admin/posts', { status: 'PUBLISHED', size: '100' }).subscribe(response => this.posts = response.content);
    this.refreshCount();
  }
  loadIssues(): void {
    this.loading = true;
    this.api.get<NewsletterIssue[]>('/admin/newsletter/issues').subscribe({ next: issues => { this.issues = issues; this.loading = false; }, error: () => { this.error = 'Não foi possível carregar as edições.'; this.loading = false; } });
  }
  loadSubscribers(): void {
    this.api.get<PageResponse<NewsletterSubscriber>>('/admin/newsletter/subscribers', { size: '100' }).subscribe(response => { this.subscribers = response.content; this.subscriberTotal = response.totalElements; });
  }
  startCreate(): void { this.editingId = null; this.form = this.emptyForm(); this.showForm = true; this.clearMessages(); }
  edit(issue: NewsletterIssue): void {
    this.editingId = issue.id;
    this.form = { subject: issue.subject, preheader: issue.preheader, mainPostId: issue.mainPostId, quickFactOne: issue.quickFactOne, quickFactTwo: issue.quickFactTwo, quickFactThree: issue.quickFactThree, videoTitle: issue.videoTitle ?? '', videoUrl: issue.videoUrl ?? '', recommendationTitle: issue.recommendationTitle ?? '', recommendationUrl: issue.recommendationUrl ?? '', communityQuestion: issue.communityQuestion };
    this.showForm = true; this.clearMessages();
  }
  save(): void {
    this.saving = true; this.clearMessages();
    const request = this.editingId ? this.api.put<NewsletterIssue>(`/admin/newsletter/issues/${this.editingId}`, this.form) : this.api.post<NewsletterIssue>('/admin/newsletter/issues', this.form);
    request.subscribe({ next: () => { this.saving = false; this.showForm = false; this.success = 'Rascunho salvo.'; this.loadIssues(); }, error: error => { this.saving = false; this.error = error?.error?.message ?? 'Não foi possível salvar a edição.'; } });
  }
  send(issue: NewsletterIssue): void {
    if (!confirm(`Enviar “${issue.subject}” para ${this.activeCount} inscritos ativos? Esta ação não pode ser desfeita.`)) return;
    this.sendingId = issue.id; this.clearMessages();
    this.api.post<{ sentCount: number; failedCount: number }>(`/admin/newsletter/issues/${issue.id}/send`, {}).subscribe({ next: result => { this.sendingId = null; this.success = `Envio concluído: ${result.sentCount} entregues e ${result.failedCount} falhas.`; this.loadIssues(); }, error: error => { this.sendingId = null; this.error = error?.error?.message ?? 'Não foi possível enviar a edição.'; } });
  }
  openPreview(issue: NewsletterIssue): void {
    this.previewLoadingId = issue.id; this.clearMessages();
    this.api.getText(`/admin/newsletter/issues/${issue.id}/preview`).subscribe({
      next: html => { this.previewIssue = issue; this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(html); this.previewLoadingId = null; },
      error: error => { this.previewLoadingId = null; this.error = error?.error?.message ?? 'Não foi possível gerar a prévia.'; }
    });
  }
  closePreview(): void { this.previewHtml = null; this.previewIssue = null; }
  removeIssue(issue: NewsletterIssue): void {
    if (!confirm(`Excluir o rascunho “${issue.subject}”?`)) return;
    this.api.delete<void>(`/admin/newsletter/issues/${issue.id}`).subscribe({ next: () => this.loadIssues(), error: error => this.error = error?.error?.message ?? 'Não foi possível excluir.' });
  }
  removeSubscriber(subscriber: NewsletterSubscriber): void {
    if (!confirm(`Excluir permanentemente ${subscriber.email} da lista?`)) return;
    this.api.delete<void>(`/admin/newsletter/subscribers/${subscriber.id}`).subscribe({ next: () => { this.loadSubscribers(); this.refreshCount(); }, error: () => this.error = 'Não foi possível excluir o inscrito.' });
  }
  cancel(): void { this.showForm = false; this.editingId = null; }
  formatDate(value: string): string { return new Date(value).toLocaleDateString('pt-BR'); }
  statusLabel(status: NewsletterSubscriber['status']): string { return { ACTIVE: 'Ativo', PENDING: 'Pendente', UNSUBSCRIBED: 'Cancelado' }[status]; }
  private refreshCount(): void { this.api.get<{ active: number }>('/admin/newsletter/subscribers/count').subscribe(response => this.activeCount = response.active); }
  private clearMessages(): void { this.error = ''; this.success = ''; }
  private emptyForm(): NewsletterIssueForm { return { subject: '', preheader: '', mainPostId: null, quickFactOne: '', quickFactTwo: '', quickFactThree: '', videoTitle: '', videoUrl: '', recommendationTitle: '', recommendationUrl: '', communityQuestion: '' }; }
}
