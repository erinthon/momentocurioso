import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ConsentService } from '../../../core/services/consent.service';
import { SeoService } from '../../../core/services/seo.service';
import { LegalShellComponent } from '../legal-shell/legal-shell.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [LegalShellComponent],
  styles: [`
    .consent-state {
      font-family: var(--fu);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-2);
    }
  `],
  template: `
    <app-legal-shell title="Política de Privacidade" updatedAt="14 de julho de 2026">
      <p>
        O <strong>Momento Curioso</strong> (momentocurioso.ia.br) respeita a sua privacidade.
        Esta política explica, de forma direta, quais dados são coletados quando você visita o site, por que
        são coletados e quais são os seus direitos.
      </p>

      <h2>Dados fornecidos por você</h2>
      <p>
        <strong>Você não precisa criar conta para ler o site.</strong> Ao se inscrever na newsletter, coletamos
        o seu e-mail e, se você quiser informar, o seu nome. Esses dados são usados exclusivamente para enviar
        a Dose Semanal de Curiosidade e administrar a sua inscrição.
      </p>
      <p>
        A inscrição exige consentimento específico e pode incluir uma confirmação por e-mail. Cada edição traz
        um link de cancelamento. Ao cancelar, interrompemos os envios; você também pode pedir a exclusão definitiva
        pelo endereço de contato informado nesta política.
      </p>

      <h2>Cookies e serviços do Google</h2>
      <p>
        O que coletamos vem de dois serviços do Google, que só são carregados <strong>depois que você aceita
        os cookies</strong> no banner exibido na sua primeira visita. Se você recusar, ou enquanto não
        decidir, <strong>nenhum script de terceiros é carregado</strong> e o site funciona normalmente.
      </p>

      <p><strong>Google Analytics</strong> — mede a audiência de forma agregada. Coleta automaticamente:</p>
      <ul>
        <li>endereço IP (tratado pelo Google);</li>
        <li>tipo de dispositivo, navegador e sistema operacional;</li>
        <li>páginas visitadas, tempo de permanência e origem do acesso;</li>
        <li>localização aproximada, no nível de cidade ou região.</li>
      </ul>
      <p>
        Esses dados são estatísticos e servem para entender quais assuntos interessam aos leitores. Não
        usamos o Analytics para identificar você pessoalmente. As páginas do painel administrativo ficam
        fora dessa medição.
      </p>

      <p>
        <strong>Google AdSense</strong> — exibe os anúncios que custeiam o site. O Google, como fornecedor
        terceiro, usa cookies e identificadores para veicular anúncios com base nas suas visitas a este e a
        outros sites, inclusive <strong>anúncios personalizados</strong>. O tratamento desses dados é feito
        pelo Google e por seus parceiros, conforme
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">
          as políticas de publicidade do Google</a>.
      </p>
      <p>
        Você pode desativar a personalização dos anúncios, sem sair do site, nas
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">
          Configurações de anúncios do Google</a>.
      </p>

      <h2>Base legal</h2>
      <p>
        O fundamento é o <strong>seu consentimento</strong> (art. 7º, I, da LGPD), coletado pelo banner de
        cookies antes de qualquer script de medição ou publicidade ser carregado. A finalidade se limita a
        entender o que os leitores procuram e a sustentar o site com publicidade.
      </p>
      <p>
        Para a newsletter, o consentimento é solicitado separadamente no formulário de inscrição e pode ser
        revogado a qualquer momento pelo link existente nos próprios e-mails.
      </p>
      <p>
        <strong>Não vendemos nem alugamos os seus dados.</strong> O compartilhamento se restringe ao Google,
        nas funções descritas acima.
      </p>

      <h2>Como revogar o consentimento</h2>
      <p>
        A sua escolha vale até você mudar de ideia — e mudar de ideia é fácil. Use o botão abaixo (ou o ícone
        🍪 no canto da tela) para reabrir o banner a qualquer momento. Ao revogar, a página é recarregada e os
        scripts de terceiros deixam de ser carregados.
      </p>
      <div class="callout">
        <p>
          Sua escolha atual: <span class="consent-state">{{ consentLabel() }}</span>
        </p>
        <p>
          <button class="btn btn-primary" (click)="manageCookies()">Gerenciar cookies</button>
        </p>
      </div>
      <p>
        Você também pode bloquear cookies nas configurações do navegador ou instalar o
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">
          complemento de desativação do Google Analytics</a>.
      </p>

      <h2>O que guardamos no seu navegador</h2>
      <p>
        Além dos cookies do Google, o site grava no armazenamento local do navegador apenas a
        <strong>sua decisão sobre os cookies</strong> (para não perguntar de novo a cada visita) e a
        preferência de tema claro/escuro. Se você for administrador do site e fizer login, um token de
        autenticação também fica guardado ali, só para manter a sessão.
      </p>

      <h2>Transferência internacional</h2>
      <p>
        Os dados coletados pelo Google podem ser processados em servidores fora do Brasil, conforme
        a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">
          política de privacidade do Google</a> e o art. 33 da LGPD.
      </p>
      <p>
        O endereço de e-mail também é processado pelo provedor de entrega contratado para realizar o envio da
        newsletter. Esse operador recebe somente os dados necessários para a entrega e deve protegê-los conforme
        a legislação aplicável.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Pela LGPD, você pode a qualquer momento pedir a confirmação do tratamento, o acesso, a correção, a
        anonimização, o bloqueio ou a eliminação dos seus dados, além de revogar o consentimento. Basta
        escrever para <strong>contato&#64;momentocurioso.ia.br</strong>, e respondemos no prazo legal.
      </p>

      <h2>Crianças e adolescentes</h2>
      <p>
        O conteúdo não é direcionado a menores de 13 anos e não coletamos dados dessa faixa etária de forma
        consciente.
      </p>

      <h2>Conteúdo gerado por inteligência artificial</h2>
      <p>
        Os textos e as imagens publicados aqui são produzidos com apoio de inteligência artificial e
        revisados antes da publicação. Isso não afeta o tratamento dos seus dados, mas informamos por
        transparência.
      </p>

      <h2>Alterações</h2>
      <p>
        Se esta política mudar, a data de atualização no topo será alterada.
      </p>

      <h2>Contato</h2>
      <p>
        <strong>contato&#64;momentocurioso.ia.br</strong>
      </p>
    </app-legal-shell>
  `
})
export class PrivacyComponent implements OnInit, OnDestroy {
  private consent = inject(ConsentService);
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Política de Privacidade',
      description: 'Como o Momento Curioso trata os seus dados: newsletter, cookies, Google Analytics, AdSense e os seus direitos pela LGPD.',
      path: '/privacidade'
    });
  }

  ngOnDestroy(): void {
    this.seo.reset();
  }

  protected consentLabel(): string {
    switch (this.consent.status()) {
      case 'granted': return 'cookies aceitos';
      case 'denied': return 'cookies recusados';
      default: return 'ainda não decidida';
    }
  }

  protected manageCookies(): void {
    this.consent.reopen();
  }
}
