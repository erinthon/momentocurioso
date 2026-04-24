package com.momentocurioso.dto.response;

import java.time.LocalDateTime;

public record ScrapedArticleResponse(
        Long id,
        Long sourceSiteId,
        String title,
        String content,
        String sourceUrl,
        LocalDateTime scrapedAt,
        boolean used
) {}
