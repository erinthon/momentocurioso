package com.momentocurioso.service;

import com.momentocurioso.dto.request.GenerateFromQueueRequest;
import com.momentocurioso.dto.response.JobStatusResponse;
import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.ScrapedArticleResponse;
import org.springframework.data.domain.Pageable;

public interface AiWriterQueueService {

    PageResponse<ScrapedArticleResponse> listQueue(Pageable pageable);

    JobStatusResponse generateFromQueue(GenerateFromQueueRequest req);
}
