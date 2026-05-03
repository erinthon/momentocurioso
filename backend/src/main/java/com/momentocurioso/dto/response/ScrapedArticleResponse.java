package com.momentocurioso.dto.response;

import com.momentocurioso.entity.ApprovalStatus;
import com.momentocurioso.entity.ScrapedArticle;

import java.time.LocalDateTime;

public record ScrapedArticleResponse(
        Long id,
        Long sourceSiteId,
        String title,
        String content,
        String sourceUrl,
        LocalDateTime scrapedAt,
        boolean used,
        ApprovalStatus approvalStatus,
        String topicName,
        String topicSlug
) {
    public static ScrapedArticleResponse from(ScrapedArticle article) {
        return new ScrapedArticleResponse(
                article.getId(),
                article.getSourceSite().getId(),
                article.getTitle(),
                article.getContent(),
                article.getSourceUrl(),
                article.getScrapedAt(),
                article.isUsed(),
                article.getApprovalStatus(),
                article.getSourceSite().getTopic().getName(),
                article.getSourceSite().getTopic().getSlug()
        );
    }
}
