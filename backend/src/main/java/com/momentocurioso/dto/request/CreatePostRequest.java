package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreatePostRequest(
        @NotBlank String title,
        @NotBlank String summary,
        @NotBlank String content,
        @NotBlank String topicSlug,
        boolean publish,
        String thumbnail
) {}
