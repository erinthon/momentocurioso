package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateTopicRequest(
        @NotBlank String name,
        String description,
        boolean autoPublish,
        boolean requireApproval
) {}
