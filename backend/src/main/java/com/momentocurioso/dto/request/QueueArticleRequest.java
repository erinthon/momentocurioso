package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotNull;

public record QueueArticleRequest(@NotNull Long aiProviderId) {}
