package com.momentocurioso.service;

import com.momentocurioso.dto.request.SaveNewsletterIssueRequest;
import com.momentocurioso.entity.*;
import com.momentocurioso.repository.NewsletterIssueRepository;
import com.momentocurioso.repository.NewsletterSubscriberRepository;
import com.momentocurioso.repository.PostRepository;
import com.momentocurioso.service.impl.NewsletterIssueServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NewsletterIssueServiceImplTest {

    @Mock NewsletterIssueRepository issueRepository;
    @Mock NewsletterSubscriberRepository subscriberRepository;
    @Mock PostRepository postRepository;
    @Mock NewsletterEmailService emailService;
    @InjectMocks NewsletterIssueServiceImpl service;

    @Test
    void createRequiresPublishedPost() {
        Post draft = post(PostStatus.DRAFT);
        when(postRepository.findById(10L)).thenReturn(Optional.of(draft));

        assertThatThrownBy(() -> service.create(request()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("publicada");
        verify(issueRepository, never()).save(any());
    }

    @Test
    void createPreservesLongUrls() {
        String longUrl = "https://example.com/" + "a".repeat(1000);
        SaveNewsletterIssueRequest request = new SaveNewsletterIssueRequest(
                "Assunto", "Prévia", 10L, "Fato 1", "Fato 2", "Fato 3",
                "Vídeo", longUrl, "Livro", longUrl, "Qual é a sua resposta?");
        when(postRepository.findById(10L)).thenReturn(Optional.of(post(PostStatus.PUBLISHED)));
        when(issueRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.create(request);

        var issueCaptor = org.mockito.ArgumentCaptor.forClass(NewsletterIssue.class);
        verify(issueRepository).save(issueCaptor.capture());
        assertThat(issueCaptor.getValue().getVideoUrl()).isEqualTo(longUrl);
        assertThat(issueCaptor.getValue().getRecommendationUrl()).isEqualTo(longUrl);
    }

    @Test
    void previewUsesEmailRenderer() {
        NewsletterIssue issue = issue();
        when(issueRepository.findById(3L)).thenReturn(Optional.of(issue));
        when(emailService.renderIssuePreview(issue)).thenReturn("<html>prévia</html>");

        assertThat(service.preview(3L)).isEqualTo("<html>prévia</html>");
    }

    @Test
    void sendContinuesAfterIndividualFailure() {
        NewsletterIssue issue = issue();
        NewsletterSubscriber first = subscriber(1L);
        NewsletterSubscriber second = subscriber(2L);
        when(issueRepository.findById(3L)).thenReturn(Optional.of(issue));
        when(emailService.isEnabled()).thenReturn(true);
        when(subscriberRepository.findAllByStatusOrderByIdAsc(NewsletterSubscriberStatus.ACTIVE))
                .thenReturn(List.of(first, second));
        doAnswer(invocation -> {
            NewsletterSubscriber recipient = invocation.getArgument(1);
            if (recipient.getId().equals(2L)) {
                throw new MailSendException("smtp failure");
            }
            return null;
        }).when(emailService).sendIssue(eq(issue), any(NewsletterSubscriber.class));

        var result = service.send(3L);

        assertThat(result.sentCount()).isEqualTo(1);
        assertThat(result.failedCount()).isEqualTo(1);
        assertThat(issue.getStatus()).isEqualTo(NewsletterIssueStatus.SENT);
        assertThat(issue.getSentAt()).isNotNull();
        verify(issueRepository).save(issue);
    }

    @Test
    void sendSkipsUnsubscribedSubscribers() {
        NewsletterIssue issue = issue();
        NewsletterSubscriber active = subscriber(1L);
        NewsletterSubscriber unsubscribed = subscriber(2L);
        unsubscribed.setStatus(NewsletterSubscriberStatus.UNSUBSCRIBED);
        when(issueRepository.findById(3L)).thenReturn(Optional.of(issue));
        when(emailService.isEnabled()).thenReturn(true);
        when(subscriberRepository.findAllByStatusOrderByIdAsc(NewsletterSubscriberStatus.ACTIVE))
                .thenReturn(List.of(active, unsubscribed));

        var result = service.send(3L);

        assertThat(result.sentCount()).isEqualTo(1);
        assertThat(result.failedCount()).isZero();
        verify(emailService).sendIssue(issue, active);
        verify(emailService, never()).sendIssue(issue, unsubscribed);
    }

    @Test
    void sendRejectsAlreadySentIssue() {
        NewsletterIssue issue = issue();
        issue.setStatus(NewsletterIssueStatus.SENT);
        when(issueRepository.findById(3L)).thenReturn(Optional.of(issue));

        assertThatThrownBy(() -> service.send(3L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("não pode ser alterada");
    }

    private SaveNewsletterIssueRequest request() {
        return new SaveNewsletterIssueRequest("Assunto", "Prévia", 10L, "Fato 1", "Fato 2", "Fato 3",
                null, null, null, null, "Qual é a sua resposta?");
    }

    private Post post(PostStatus status) {
        Post post = new Post();
        post.setId(10L);
        post.setTitle("História");
        post.setSlug("historia");
        post.setSummary("Resumo");
        post.setStatus(status);
        return post;
    }

    private NewsletterIssue issue() {
        NewsletterIssue issue = new NewsletterIssue();
        issue.setId(3L);
        issue.setMainPost(post(PostStatus.PUBLISHED));
        issue.setStatus(NewsletterIssueStatus.DRAFT);
        issue.setSubject("Dose semanal");
        return issue;
    }

    private NewsletterSubscriber subscriber(Long id) {
        NewsletterSubscriber subscriber = new NewsletterSubscriber();
        subscriber.setId(id);
        subscriber.setEmail("leitor" + id + "@example.com");
        subscriber.setStatus(NewsletterSubscriberStatus.ACTIVE);
        return subscriber;
    }
}
