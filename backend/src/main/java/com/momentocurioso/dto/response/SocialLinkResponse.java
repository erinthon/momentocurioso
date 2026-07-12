package com.momentocurioso.dto.response;

import com.momentocurioso.entity.SocialLink;
import com.momentocurioso.entity.SocialPlatform;

public record SocialLinkResponse(
        Long id,
        SocialPlatform platform,
        String url,
        boolean active,
        int displayOrder
) {
    public static SocialLinkResponse from(SocialLink link) {
        return new SocialLinkResponse(
                link.getId(),
                link.getPlatform(),
                link.getUrl(),
                link.isActive(),
                link.getDisplayOrder()
        );
    }
}
