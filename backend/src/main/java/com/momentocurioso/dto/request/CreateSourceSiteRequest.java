package com.momentocurioso.dto.request;

import com.momentocurioso.entity.SourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateSourceSiteRequest(
        @NotNull Long topicId,
        @NotBlank String url,
        @NotNull SourceType type
) {}
