package com.momentocurioso.dto.response;

import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.JobStatus;
import com.momentocurioso.entity.TriggerSource;

import java.time.LocalDateTime;

public record JobStatusResponse(
        Long id,
        String topicSlug,
        JobStatus status,
        TriggerSource triggeredBy,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        String errorMessage,
        Long postId,
        Integer articlesFound,
        Integer articlesUsed,
        Integer articlesSkipped,
        String summary
) {
    public static JobStatusResponse from(ContentGenerationJob job) {
        return new JobStatusResponse(
                job.getId(),
                job.getTopic().getSlug(),
                job.getStatus(),
                job.getTriggeredBy(),
                job.getStartedAt(),
                job.getFinishedAt(),
                job.getErrorMessage(),
                job.getPost() != null ? job.getPost().getId() : null,
                job.getArticlesFound(),
                job.getArticlesUsed(),
                job.getArticlesSkipped(),
                job.getSummary()
        );
    }
}
