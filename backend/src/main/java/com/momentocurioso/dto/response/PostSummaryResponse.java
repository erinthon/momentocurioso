package com.momentocurioso.dto.response;

import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.PostStatus;

import java.time.LocalDateTime;

public record PostSummaryResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String topicSlug,
        PostStatus status,
        LocalDateTime createdAt,
        LocalDateTime publishedAt
) {
    public static PostSummaryResponse from(Post post) {
        return new PostSummaryResponse(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getSummary(),
                post.getTopic().getSlug(),
                post.getStatus(),
                post.getCreatedAt(),
                post.getPublishedAt()
        );
    }
}
