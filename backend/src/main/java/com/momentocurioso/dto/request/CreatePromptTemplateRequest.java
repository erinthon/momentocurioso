package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreatePromptTemplateRequest(
        @NotBlank String name,
        @NotBlank String template
) {}
