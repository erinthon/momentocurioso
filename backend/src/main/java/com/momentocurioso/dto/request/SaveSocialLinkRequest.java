package com.momentocurioso.dto.request;

import com.momentocurioso.entity.SocialPlatform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record SaveSocialLinkRequest(
        @NotNull SocialPlatform platform,
        @NotBlank @Pattern(regexp = "^https://.+", message = "url deve começar com https://") String url,
        boolean active,
        int displayOrder
) {}
