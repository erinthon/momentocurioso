package com.momentocurioso.service.impl;

import com.momentocurioso.dto.request.SaveNewsletterIssueRequest;
import com.momentocurioso.dto.response.NewsletterIssueResponse;
import com.momentocurioso.dto.response.NewsletterSendResponse;
import com.momentocurioso.entity.*;
import com.momentocurioso.repository.NewsletterIssueRepository;
import com.momentocurioso.repository.NewsletterSubscriberRepository;
import com.momentocurioso.repository.PostRepository;
import com.momentocurioso.service.NewsletterEmailService;
import com.momentocurioso.service.NewsletterIssueService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NewsletterIssueServiceImpl implements NewsletterIssueService {

    private static final Logger log = LoggerFactory.getLogger(NewsletterIssueServiceImpl.class);

    private final NewsletterIssueRepository issueRepository;
    private final NewsletterSubscriberRepository subscriberRepository;
    private final PostRepository postRepository;
    private final NewsletterEmailService emailService;

    public NewsletterIssueServiceImpl(NewsletterIssueRepository issueRepository,
                                      NewsletterSubscriberRepository subscriberRepository,
                                      PostRepository postRepository,
                                      NewsletterEmailService emailService) {
        this.issueRepository = issueRepository;
        this.subscriberRepository = subscriberRepository;
        this.postRepository = postRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NewsletterIssueResponse> list() {
        return issueRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(NewsletterIssueResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public NewsletterIssueResponse create(SaveNewsletterIssueRequest request) {
        NewsletterIssue issue = new NewsletterIssue();
        apply(issue, request);
        return NewsletterIssueResponse.from(issueRepository.save(issue));
    }

    @Override
    @Transactional
    public NewsletterIssueResponse update(Long id, SaveNewsletterIssueRequest request) {
        NewsletterIssue issue = getDraft(id);
        apply(issue, request);
        return NewsletterIssueResponse.from(issueRepository.save(issue));
    }

    @Override
    @Transactional(readOnly = true)
    public String preview(Long id) {
        return emailService.renderIssuePreview(getDraft(id));
    }

    @Override
    @Transactional
    public NewsletterSendResponse send(Long id) {
        NewsletterIssue issue = getDraft(id);
        if (!emailService.isEnabled()) {
            throw new IllegalStateException("O envio da newsletter não está habilitado");
        }

        List<NewsletterSubscriber> subscribers = subscriberRepository
                .findAllByStatusOrderByIdAsc(NewsletterSubscriberStatus.ACTIVE);
        if (subscribers.isEmpty()) {
            throw new IllegalStateException("Não há inscritos ativos para receber esta edição");
        }

        int sent = 0;
        int failed = 0;
        for (NewsletterSubscriber subscriber : subscribers) {
            if (subscriber.getStatus() != NewsletterSubscriberStatus.ACTIVE) {
                continue;
            }
            try {
                emailService.sendIssue(issue, subscriber);
                sent++;
            } catch (RuntimeException ex) {
                failed++;
                log.error("Falha ao enviar newsletter {} ao inscrito {}", issue.getId(), subscriber.getId(), ex);
            }
        }

        issue.setSentCount(sent);
        issue.setFailedCount(failed);
        if (sent > 0) {
            issue.setStatus(NewsletterIssueStatus.SENT);
            issue.setSentAt(LocalDateTime.now());
        }
        issueRepository.save(issue);

        if (sent == 0) {
            throw new IllegalStateException("Nenhum e-mail foi enviado; verifique a configuração SMTP");
        }
        return new NewsletterSendResponse(issue.getId(), sent, failed);
    }

    @Override
    public void delete(Long id) {
        NewsletterIssue issue = getDraft(id);
        issueRepository.delete(issue);
    }

    private NewsletterIssue getDraft(Long id) {
        NewsletterIssue issue = issueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Edição não encontrada: " + id));
        if (issue.getStatus() != NewsletterIssueStatus.DRAFT) {
            throw new IllegalStateException("Uma edição enviada não pode ser alterada");
        }
        return issue;
    }

    private void apply(NewsletterIssue issue, SaveNewsletterIssueRequest request) {
        Post post = postRepository.findById(request.mainPostId())
                .orElseThrow(() -> new EntityNotFoundException("Post não encontrado: " + request.mainPostId()));
        if (post.getStatus() != PostStatus.PUBLISHED) {
            throw new IllegalArgumentException("A história principal precisa estar publicada");
        }

        issue.setSubject(request.subject().trim());
        issue.setPreheader(request.preheader().trim());
        issue.setMainPost(post);
        issue.setQuickFactOne(request.quickFactOne().trim());
        issue.setQuickFactTwo(request.quickFactTwo().trim());
        issue.setQuickFactThree(request.quickFactThree().trim());
        issue.setVideoTitle(trimToNull(request.videoTitle()));
        issue.setVideoUrl(trimToNull(request.videoUrl()));
        issue.setRecommendationTitle(trimToNull(request.recommendationTitle()));
        issue.setRecommendationUrl(trimToNull(request.recommendationUrl()));
        issue.setCommunityQuestion(request.communityQuestion().trim());
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
