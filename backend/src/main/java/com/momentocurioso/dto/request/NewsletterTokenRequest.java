package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NewsletterTokenRequest(
        @NotBlank @Size(max = 100) String token
) {
}
