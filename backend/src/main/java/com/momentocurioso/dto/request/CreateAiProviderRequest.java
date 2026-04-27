package com.momentocurioso.dto.request;

import com.momentocurioso.entity.AiProviderType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAiProviderRequest(
        @NotBlank String name,
        @NotNull AiProviderType type,
        @NotBlank String apiKey,
        String baseUrl,
        @NotBlank String model
) {}
