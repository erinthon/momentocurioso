package com.momentocurioso.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SaveNewsletterIssueRequest(
        @NotBlank @Size(max = 255) String subject,
        @NotBlank @Size(max = 255) String preheader,
        @NotNull Long mainPostId,
        @NotBlank @Size(max = 500) String quickFactOne,
        @NotBlank @Size(max = 500) String quickFactTwo,
        @NotBlank @Size(max = 500) String quickFactThree,
        @Size(max = 255) String videoTitle,
        @Pattern(regexp = "^$|https://.*", message = "A URL do vídeo deve usar HTTPS") String videoUrl,
        @Size(max = 255) String recommendationTitle,
        @Pattern(regexp = "^$|https://.*", message = "A URL da recomendação deve usar HTTPS") String recommendationUrl,
        @NotBlank @Size(max = 500) String communityQuestion
) {
}
