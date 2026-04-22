package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateTopicRequest(
        @NotBlank String name,
        @NotBlank @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must be lowercase letters, numbers and hyphens only") String slug,
        String description,
        boolean autoPublish
) {}
