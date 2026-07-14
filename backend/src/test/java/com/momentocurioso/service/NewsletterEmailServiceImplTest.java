package com.momentocurioso.service;

import com.momentocurioso.entity.NewsletterIssue;
import com.momentocurioso.entity.Post;
import com.momentocurioso.service.impl.NewsletterEmailServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class NewsletterEmailServiceImplTest {

    @Test
    void previewUsesDeliveryLayoutAndEscapesContent() {
        NewsletterEmailServiceImpl service = new NewsletterEmailServiceImpl(
                mock(JavaMailSender.class), mock(NewsletterTokenService.class), false,
                "newsletter@example.com", "Momento Curioso", "https://example.com");

        String html = service.renderIssuePreview(issue());

        assertThat(html)
                .contains("Dose Semanal de Curiosidade")
                .contains("Texto de pr&eacute;via")
                .contains("https://example.com/blog/posts/historia")
                .contains("https://example.com/newsletter/unsubscribe")
                .contains("&lt;script&gt;alert(1)&lt;/script&gt;")
                .doesNotContain("<script>alert(1)</script>");
    }

    private NewsletterIssue issue() {
        Post post = new Post();
        post.setTitle("História principal");
        post.setSlug("historia");
        post.setSummary("Resumo da história");

        NewsletterIssue issue = new NewsletterIssue();
        issue.setPreheader("Texto de prévia");
        issue.setMainPost(post);
        issue.setQuickFactOne("Fato 1");
        issue.setQuickFactTwo("Fato 2");
        issue.setQuickFactThree("Fato 3");
        issue.setCommunityQuestion("<script>alert(1)</script>");
        return issue;
    }
}
