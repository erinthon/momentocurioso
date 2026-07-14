package com.momentocurioso.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.service.impl.PostPageRendererImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PostPageRendererImplTest {

    @TempDir
    Path tempDir;

    @Test
    void render_injectsMetadataAndSanitizedArticleIntoCsrShell() throws Exception {
        Path index = tempDir.resolve("index.csr.html");
        Files.writeString(index, """
                <!doctype html><html><head>
                <title>Momento Curioso</title>
                <meta name="description" content="Genérica">
                <meta property="og:title" content="Momento Curioso">
                </head><body><app-root></app-root><script src="main.js"></script></body></html>
                """);
        PostThumbnailService thumbnailService = mock(PostThumbnailService.class);
        when(thumbnailService.isSupported("data:image/png;base64,AQID")).thenReturn(true);
        PostPageRenderer renderer = new PostPageRendererImpl(
                index.toString(),
                "https://momentocurioso.ia.br/",
                new ObjectMapper(),
                thumbnailService);
        PostResponse post = new PostResponse(
                1L,
                "Título <especial>",
                "titulo-especial",
                "Resumo com \"aspas\" & detalhes",
                "<p>Conteúdo seguro</p><script>alert('xss')</script><img src=\"data:image/png;base64,AQID\">",
                "data:image/png;base64,AQID",
                "tecnologia",
                PostStatus.PUBLISHED,
                LocalDateTime.of(2026, 7, 14, 10, 0),
                LocalDateTime.of(2026, 7, 14, 9, 0));

        String html = renderer.render(post);

        assertThat(html)
                .contains("<title>Título &lt;especial&gt; | Momento Curioso</title>")
                .contains("rel=\"canonical\" href=\"https://momentocurioso.ia.br/blog/posts/titulo-especial\"")
                .contains("property=\"og:image\" content=\"https://momentocurioso.ia.br/api/posts/titulo-especial/social-thumbnail\"")
                .contains("property=\"og:image:type\" content=\"image/jpeg\"")
                .contains("property=\"og:image:width\" content=\"1200\"")
                .contains("property=\"og:image:height\" content=\"630\"")
                .contains("name=\"twitter:card\" content=\"summary_large_image\"")
                .contains("type=\"application/ld+json\"")
                .contains("<h1>Título &lt;especial&gt;</h1>")
                .contains("<p>Conteúdo seguro</p>")
                .contains("<script src=\"main.js\"></script>")
                .doesNotContain("alert('xss')")
                .doesNotContain("data:image/png;base64,AQID\">");
    }

    @Test
    void render_withoutThumbnail_usesSummaryCardAndOmitsImage() throws Exception {
        Path index = tempDir.resolve("index.csr.html");
        Files.writeString(index, "<html><head><title>Genérico</title></head><body><app-root></app-root></body></html>");
        PostThumbnailService thumbnailService = mock(PostThumbnailService.class);
        PostPageRenderer renderer = new PostPageRendererImpl(
                index.toString(),
                "https://momentocurioso.ia.br",
                new ObjectMapper(),
                thumbnailService);
        PostResponse post = new PostResponse(
                1L, "Título", "titulo", "Resumo", "<p>Conteúdo</p>", null,
                "tecnologia", PostStatus.PUBLISHED, LocalDateTime.now(), LocalDateTime.now());

        String html = renderer.render(post);

        assertThat(html).contains("name=\"twitter:card\" content=\"summary\"");
        assertThat(html).doesNotContain("property=\"og:image\"");
    }
}
