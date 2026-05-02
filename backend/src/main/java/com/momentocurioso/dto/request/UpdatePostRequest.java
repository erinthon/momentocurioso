package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdatePostRequest(
        @NotBlank String title,
        @NotBlank String summary,
        @NotBlank String content
) {}
