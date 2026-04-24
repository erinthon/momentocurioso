package com.momentocurioso.dto.response;

import com.momentocurioso.entity.Post;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String content,
        String topicSlug,
        LocalDateTime publishedAt
) {
    public static PostResponse from(Post post) {
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getSummary(),
                post.getContent(),
                post.getTopic().getSlug(),
                post.getPublishedAt()
        );
    }
}
