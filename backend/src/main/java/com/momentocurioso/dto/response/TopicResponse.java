package com.momentocurioso.dto.response;

import com.momentocurioso.entity.Topic;

public record TopicResponse(
        Long id,
        String name,
        String slug,
        String description,
        boolean autoPublish,
        boolean active,
        boolean requireApproval
) {
    public static TopicResponse from(Topic topic) {
        return new TopicResponse(
                topic.getId(),
                topic.getName(),
                topic.getSlug(),
                topic.getDescription(),
                topic.isAutoPublish(),
                topic.isActive(),
                topic.isRequireApproval()
        );
    }
}
