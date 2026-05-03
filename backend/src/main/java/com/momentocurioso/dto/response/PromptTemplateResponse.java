package com.momentocurioso.dto.response;

import com.momentocurioso.entity.PromptTemplate;

import java.time.LocalDateTime;

public record PromptTemplateResponse(
        Long id,
        String name,
        String template,
        boolean isDefault,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static PromptTemplateResponse from(PromptTemplate pt) {
        return new PromptTemplateResponse(
                pt.getId(),
                pt.getName(),
                pt.getTemplate(),
                pt.isDefault(),
                pt.getCreatedAt(),
                pt.getUpdatedAt()
        );
    }
}
