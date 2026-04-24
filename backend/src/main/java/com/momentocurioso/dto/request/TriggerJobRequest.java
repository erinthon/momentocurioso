package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotNull;

public record TriggerJobRequest(@NotNull Long topicId) {}
