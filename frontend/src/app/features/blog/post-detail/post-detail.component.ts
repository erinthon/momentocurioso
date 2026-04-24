import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1rem;color:var(--mid);">
      <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;">Em breve</span>
      <a routerLink="/blog/posts" style="font-family:var(--font-mono);font-size:11px;color:var(--gold);letter-spacing:.08em;">← Voltar</a>
    </div>
  `
})
export class PostDetailComponent {}
