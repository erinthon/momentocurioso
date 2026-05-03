package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record GenerateFromQueueRequest(
        @NotNull Long topicId,
        @NotNull Long aiProviderId,
        @NotNull @Size(min = 1) List<Long> articleIds
) {}
