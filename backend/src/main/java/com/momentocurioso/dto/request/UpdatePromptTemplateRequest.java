package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdatePromptTemplateRequest(
        @NotBlank String name,
        @NotBlank String template
) {}
