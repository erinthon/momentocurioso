package com.momentocurioso.dto.response;

import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.PostStatus;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String content,
        String topicSlug,
        PostStatus status,
        LocalDateTime publishedAt,
        LocalDateTime createdAt
) {
    public static PostResponse from(Post post) {
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getSummary(),
                post.getContent(),
                post.getTopic().getSlug(),
                post.getStatus(),
                post.getPublishedAt(),
                post.getCreatedAt()
        );
    }
}
