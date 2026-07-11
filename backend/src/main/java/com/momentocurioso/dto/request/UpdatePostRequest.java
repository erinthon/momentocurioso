package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdatePostRequest(
        @NotBlank String title,
        @NotBlank String summary,
        @NotBlank String content,
        String thumbnail,
        @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must be lowercase letters, numbers and hyphens only")
        String slug
) {}
