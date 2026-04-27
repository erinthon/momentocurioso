package com.momentocurioso.dto.response;

import com.momentocurioso.entity.AiProvider;
import com.momentocurioso.entity.AiProviderType;

import java.time.LocalDateTime;

public record AiProviderResponse(
        Long id,
        String name,
        AiProviderType type,
        String baseUrl,
        String model,
        boolean active,
        LocalDateTime createdAt
) {
    public static AiProviderResponse from(AiProvider provider) {
        return new AiProviderResponse(
                provider.getId(),
                provider.getName(),
                provider.getType(),
                provider.getBaseUrl(),
                provider.getModel(),
                provider.isActive(),
                provider.getCreatedAt()
        );
    }
}
