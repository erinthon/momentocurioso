package com.momentocurioso.service;

import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.ScrapedArticleResponse;
import com.momentocurioso.entity.ApprovalStatus;
import org.springframework.data.domain.Pageable;

public interface ScrapedArticleService {
    PageResponse<ScrapedArticleResponse> listAll(Long topicId, Long sourceSiteId, ApprovalStatus status, Pageable pageable);
    ScrapedArticleResponse getById(Long id);
    ScrapedArticleResponse approve(Long id);
    ScrapedArticleResponse reject(Long id);
    ScrapedArticleResponse queueForAi(Long id, Long aiProviderId);
}
