package com.momentocurioso.dto.response;

import com.momentocurioso.entity.NewsletterIssue;
import com.momentocurioso.entity.NewsletterIssueStatus;

import java.time.LocalDateTime;

public record NewsletterIssueResponse(
        Long id,
        String subject,
        String preheader,
        Long mainPostId,
        String mainPostTitle,
        String mainPostSlug,
        String quickFactOne,
        String quickFactTwo,
        String quickFactThree,
        String videoTitle,
        String videoUrl,
        String recommendationTitle,
        String recommendationUrl,
        String communityQuestion,
        NewsletterIssueStatus status,
        int sentCount,
        int failedCount,
        LocalDateTime sentAt,
        LocalDateTime createdAt
) {
    public static NewsletterIssueResponse from(NewsletterIssue issue) {
        return new NewsletterIssueResponse(
                issue.getId(),
                issue.getSubject(),
                issue.getPreheader(),
                issue.getMainPost().getId(),
                issue.getMainPost().getTitle(),
                issue.getMainPost().getSlug(),
                issue.getQuickFactOne(),
                issue.getQuickFactTwo(),
                issue.getQuickFactThree(),
                issue.getVideoTitle(),
                issue.getVideoUrl(),
                issue.getRecommendationTitle(),
                issue.getRecommendationUrl(),
                issue.getCommunityQuestion(),
                issue.getStatus(),
                issue.getSentCount(),
                issue.getFailedCount(),
                issue.getSentAt(),
                issue.getCreatedAt()
        );
    }
}
