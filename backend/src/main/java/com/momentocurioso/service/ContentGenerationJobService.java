package com.momentocurioso.service;

import com.momentocurioso.dto.response.JobStatusResponse;
import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.JobStatus;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.entity.TriggerSource;
import org.springframework.data.domain.Pageable;

public interface ContentGenerationJobService {

    ContentGenerationJob createJob(Topic topic, TriggerSource triggeredBy);

    ContentGenerationJob markRunning(ContentGenerationJob job);

    ContentGenerationJob markDone(ContentGenerationJob job, Post post, int articlesFound, int articlesUsed);

    ContentGenerationJob markDone(ContentGenerationJob job, Post post, int articlesFound, int articlesUsed, String summary);

    ContentGenerationJob markFailed(ContentGenerationJob job, String errorMessage, int articlesFound);

    PageResponse<JobStatusResponse> listAllAdmin(JobStatus status, Pageable pageable);
}
