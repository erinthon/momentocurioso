package com.momentocurioso.service.impl;

import com.momentocurioso.dto.response.AdminDashboardResponse;
import com.momentocurioso.dto.response.AiProviderResponse;
import com.momentocurioso.dto.response.JobStatusResponse;
import com.momentocurioso.entity.ApprovalStatus;
import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.repository.AiProviderRepository;
import com.momentocurioso.repository.ContentGenerationJobRepository;
import com.momentocurioso.repository.PostRepository;
import com.momentocurioso.repository.ScrapedArticleRepository;
import com.momentocurioso.service.DashboardService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final PostRepository postRepository;
    private final ScrapedArticleRepository scrapedArticleRepository;
    private final ContentGenerationJobRepository jobRepository;
    private final AiProviderRepository aiProviderRepository;

    public DashboardServiceImpl(PostRepository postRepository,
                                ScrapedArticleRepository scrapedArticleRepository,
                                ContentGenerationJobRepository jobRepository,
                                AiProviderRepository aiProviderRepository) {
        this.postRepository = postRepository;
        this.scrapedArticleRepository = scrapedArticleRepository;
        this.jobRepository = jobRepository;
        this.aiProviderRepository = aiProviderRepository;
    }

    @Override
    public AdminDashboardResponse getSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        long postsToday = postRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        long pendingArticles = scrapedArticleRepository.countByApprovalStatus(ApprovalStatus.PENDING);
        long queuedArticles = scrapedArticleRepository.countByApprovalStatus(ApprovalStatus.QUEUED);
        long totalPublishedPosts = postRepository.countByStatus(PostStatus.PUBLISHED);

        JobStatusResponse lastJob = jobRepository.findFirstByOrderByStartedAtDesc()
                .map(JobStatusResponse::from)
                .orElse(null);

        AiProviderResponse activeProvider = aiProviderRepository.findFirstByActiveTrue()
                .map(AiProviderResponse::from)
                .orElse(null);

        return new AdminDashboardResponse(
                postsToday,
                pendingArticles,
                queuedArticles,
                totalPublishedPosts,
                lastJob,
                activeProvider
        );
    }
}
