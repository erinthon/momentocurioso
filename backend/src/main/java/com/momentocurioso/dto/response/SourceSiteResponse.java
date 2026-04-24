package com.momentocurioso.dto.response;

import com.momentocurioso.entity.SourceSite;
import com.momentocurioso.entity.SourceType;

public record SourceSiteResponse(
        Long id,
        Long topicId,
        String topicName,
        String url,
        SourceType type,
        boolean active
) {
    public static SourceSiteResponse from(SourceSite sourceSite) {
        return new SourceSiteResponse(
                sourceSite.getId(),
                sourceSite.getTopic().getId(),
                sourceSite.getTopic().getName(),
                sourceSite.getUrl(),
                sourceSite.getType(),
                sourceSite.isActive()
        );
    }
}
