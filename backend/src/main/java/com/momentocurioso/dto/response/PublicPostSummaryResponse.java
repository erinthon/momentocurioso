package com.momentocurioso.dto.response;

import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.PostStatus;

import java.time.LocalDateTime;

public record PublicPostSummaryResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String thumbnail,
        String topicSlug,
        PostStatus status,
        LocalDateTime createdAt,
        LocalDateTime publishedAt
) {
    public static PublicPostSummaryResponse from(Post post) {
        String thumbnailUrl = post.getThumbnail() == null || post.getThumbnail().isBlank()
                ? null
                : "/api/posts/" + post.getSlug() + "/thumbnail";
        return new PublicPostSummaryResponse(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getSummary(),
                thumbnailUrl,
                post.getTopic().getSlug(),
                post.getStatus(),
                post.getCreatedAt(),
                post.getPublishedAt()
        );
    }
}
