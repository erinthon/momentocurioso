package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateTopicRequest(
        @NotBlank String name,
        String description,
        boolean autoPublish,
        boolean requireApproval,
        @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must be lowercase letters, numbers and hyphens only")
        String slug
) {}
