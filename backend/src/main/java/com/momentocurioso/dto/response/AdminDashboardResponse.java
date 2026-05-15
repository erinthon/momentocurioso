package com.momentocurioso.dto.response;

public record AdminDashboardResponse(
        long postsToday,
        long pendingArticles,
        long queuedArticles,
        long totalPublishedPosts,
        JobStatusResponse lastJob,
        AiProviderResponse activeProvider
) {}
