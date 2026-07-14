package com.momentocurioso.dto.response;

public record NewsletterSendResponse(
        Long issueId,
        int sentCount,
        int failedCount
) {
}
