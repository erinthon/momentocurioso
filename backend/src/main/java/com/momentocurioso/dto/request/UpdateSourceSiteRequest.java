package com.momentocurioso.dto.request;

import com.momentocurioso.entity.SourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record UpdateSourceSiteRequest(
        @NotBlank @Pattern(regexp = "^https?://.*", message = "URL must start with http:// or https://") String url,
        @NotNull SourceType type
) {}
