package com.momentocurioso.dto.response;

public record NotificationCountsResponse(
        long pendingApproval,
        long queued
) {
}
