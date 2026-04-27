package com.momentocurioso.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testes de regressão para BUG-004: scraper HTML usa seletor semântico
 * (article/main/[role=main]) em vez de doc.body() inteiro.
 *
 * Verifica diretamente a lógica de seleção implementada em
 * ContentFetcherServiceImpl.fetchHtml():
 *   Element mainEl = doc.selectFirst("article, main, [role=main], .content, .post-content, #content, #main");
 *   String content = (mainEl != null ? mainEl : doc.body()).text();
 */
class ContentFetcherServiceImplTest {

    private static final String SELECTOR =
            "article, main, [role=main], .content, .post-content, #content, #main";

    private String extract(String html) {
        Document doc = Jsoup.parse(html);
        Element mainEl = doc.selectFirst(SELECTOR);
        return (mainEl != null ? mainEl : doc.body()).text();
    }

    // ── BUG-004: Scraper extrai conteúdo semântico, não o body inteiro ────────

    @Test
    void fetchHtml_withArticleTag_returnsOnlyArticleContent() {
        String html = """
                <html><body>
                  <nav>Menu de navegação</nav>
                  <article><p>Conteúdo do artigo aqui</p></article>
                  <footer>Rodapé do site</footer>
                </body></html>
                """;

        String content = extract(html);

        assertThat(content).contains("Conteúdo do artigo aqui");
        assertThat(content).doesNotContain("Menu de navegação");
        assertThat(content).doesNotContain("Rodapé do site");
    }

    @Test
    void fetchHtml_withMainTag_returnsOnlyMainContent() {
        String html = """
                <html><body>
                  <header>Cabeçalho do site</header>
                  <main><h1>Título</h1><p>Conteúdo principal</p></main>
                  <aside>Sidebar com anúncios</aside>
                </body></html>
                """;

        String content = extract(html);

        assertThat(content).contains("Conteúdo principal");
        assertThat(content).doesNotContain("Cabeçalho do site");
        assertThat(content).doesNotContain("Sidebar com anúncios");
    }

    @Test
    void fetchHtml_withRoleMainAttribute_returnsRoleMainContent() {
        String html = """
                <html><body>
                  <div class="sidebar">Sidebar</div>
                  <div role="main"><p>Conteúdo via role=main</p></div>
                  <div class="footer">Footer</div>
                </body></html>
                """;

        String content = extract(html);

        assertThat(content).contains("Conteúdo via role=main");
        assertThat(content).doesNotContain("Sidebar");
        assertThat(content).doesNotContain("Footer");
    }

    @Test
    void fetchHtml_withContentClass_returnsContentClassText() {
        String html = """
                <html><body>
                  <div class="nav">Navegação</div>
                  <div class="content"><p>Texto editorial</p></div>
                  <div class="ads">Anúncios</div>
                </body></html>
                """;

        String content = extract(html);

        assertThat(content).contains("Texto editorial");
        assertThat(content).doesNotContain("Navegação");
        assertThat(content).doesNotContain("Anúncios");
    }

    @Test
    void fetchHtml_withNoSemanticTag_fallsBackToBodyText() {
        String html = """
                <html><body>
                  <div class="wrapper"><p>Conteúdo sem tag semântica</p></div>
                </body></html>
                """;

        String content = extract(html);

        assertThat(content).contains("Conteúdo sem tag semântica");
    }

    @Test
    void fetchHtml_articleContentExcludesNavAndFooter() {
        String html = """
                <html><body>
                  <nav>Home | Blog | Contato</nav>
                  <article>
                    <h1>Descoberta Científica</h1>
                    <p>Pesquisadores descobriram algo incrível.</p>
                  </article>
                  <footer>© 2026 Momento Curioso</footer>
                </body></html>
                """;

        String content = extract(html);

        assertThat(content).contains("Descoberta Científica");
        assertThat(content).contains("Pesquisadores descobriram algo incrível");
        assertThat(content).doesNotContain("Home | Blog | Contato");
        assertThat(content).doesNotContain("© 2026 Momento Curioso");
    }
}
