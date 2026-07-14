import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { LegalShellComponent } from '../legal-shell/legal-shell.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterLink, LegalShellComponent],
  template: `
    <app-legal-shell title="Termos de Uso" updatedAt="14 de julho de 2026">
      <p>
        Ao acessar o <strong>Momento Curioso</strong> (momentocurioso.ia.br), você concorda com os termos
        abaixo. Se não concordar, por favor não utilize o site.
      </p>

      <h2>O que é este site</h2>
      <p>
        O Momento Curioso é um site de conteúdo informativo e de entretenimento sobre curiosidades de
        ciência, tecnologia, natureza, história e cultura. O acesso é <strong>gratuito</strong> e não exige
        cadastro. O site é sustentado por publicidade exibida pelo Google AdSense — os detalhes de como isso
        afeta os seus dados estão na <a routerLink="/privacidade">Política de Privacidade</a>.
      </p>

      <h2>Newsletter</h2>
      <p>
        A inscrição na newsletter é opcional e exige um endereço de e-mail válido e consentimento específico.
        Você pode cancelar os envios a qualquer momento pelo link presente nos próprios e-mails. O site pode
        guardar no seu navegador um marcador sem dados pessoais para avisar que uma solicitação já foi enviada.
        Os detalhes estão na <a routerLink="/privacidade">Política de Privacidade</a>.
      </p>

      <h2>Conteúdo gerado por inteligência artificial</h2>
      <p>
        Os textos e as imagens são produzidos <strong>com apoio de inteligência artificial</strong> e
        revisados antes de publicar. Checamos os fatos e citamos as fontes quando elas existem, mas:
      </p>
      <ul>
        <li>as <strong>imagens são ilustrações</strong>, não registros fotográficos reais dos fatos narrados;</li>
        <li>podem existir erros — quando um dado é estimativa ou hipótese, procuramos dizer isso no próprio texto.</li>
      </ul>
      <p>
        O conteúdo tem finalidade informativa e de entretenimento. <strong>Não é aconselhamento
        profissional</strong> de nenhuma natureza. Se um assunto for importante para uma decisão sua,
        consulte as fontes primárias.
      </p>

      <h2>Uso do conteúdo</h2>
      <p>Os textos e as imagens originais deste site são de titularidade do Momento Curioso.</p>
      <ul>
        <li>
          Você pode <strong>ler, compartilhar o link e citar trechos curtos</strong>, com atribuição e link
          para a página original.
        </li>
        <li>
          Você <strong>não pode</strong> copiar o conteúdo por inteiro, republicá-lo como se fosse seu, nem
          usá-lo comercialmente sem autorização escrita.
        </li>
      </ul>
      <p>
        Materiais de terceiros eventualmente utilizados (fotografias em domínio público ou sob licença
        Creative Commons, trilhas licenciadas) têm o crédito indicado no próprio conteúdo e permanecem sob a
        licença dos seus titulares.
      </p>

      <h2>Links externos</h2>
      <p>
        O site pode conter links para páginas de terceiros. Não temos controle sobre esses sites e não
        respondemos pelo conteúdo, pelas práticas de privacidade nem pela disponibilidade deles.
      </p>

      <h2>Disponibilidade e limitação de responsabilidade</h2>
      <p>
        O site é oferecido <strong>"como está"</strong>. Não garantimos funcionamento ininterrupto nem
        ausência de erros, e não nos responsabilizamos por perdas decorrentes do uso ou da indisponibilidade
        do site, salvo nos casos em que a lei não admitir essa limitação.
      </p>

      <h2>Erros e correções</h2>
      <p>
        Achou um erro? Escreva para <strong>contato&#64;momentocurioso.ia.br</strong>. Correções de fato são
        bem-vindas e feitas com prioridade.
      </p>

      <h2>Alterações destes termos</h2>
      <p>
        Estes termos podem ser atualizados. A data no topo indica a última versão. O uso continuado do site
        após uma alteração significa concordância com a nova versão.
      </p>

      <h2>Lei aplicável</h2>
      <p>
        Aplica-se a legislação brasileira, em especial a Lei nº 13.709/2018 (LGPD) e a Lei nº 12.965/2014
        (Marco Civil da Internet).
      </p>

      <h2>Contato</h2>
      <p><strong>contato&#64;momentocurioso.ia.br</strong></p>
    </app-legal-shell>
  `
})
export class TermsComponent implements OnInit, OnDestroy {
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Termos de Uso',
      description: 'Regras de uso do Momento Curioso: conteúdo gerado com apoio de IA, direitos sobre o conteúdo e limitação de responsabilidade.',
      path: '/termos'
    });
  }

  ngOnDestroy(): void {
    this.seo.reset();
  }
}
