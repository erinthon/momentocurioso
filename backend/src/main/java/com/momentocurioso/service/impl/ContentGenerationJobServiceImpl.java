package com.momentocurioso.service.impl;

import com.momentocurioso.dto.response.JobStatusResponse;
import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.JobStatus;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.entity.TriggerSource;
import com.momentocurioso.repository.ContentGenerationJobRepository;
import com.momentocurioso.service.ContentGenerationJobService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContentGenerationJobServiceImpl implements ContentGenerationJobService {

    private final ContentGenerationJobRepository jobRepository;

    public ContentGenerationJobServiceImpl(ContentGenerationJobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @Override
    public ContentGenerationJob createJob(Topic topic, TriggerSource triggeredBy) {
        ContentGenerationJob job = new ContentGenerationJob();
        job.setTopic(topic);
        job.setTriggeredBy(triggeredBy);
        job.setStatus(JobStatus.PENDING);
        job.setStartedAt(LocalDateTime.now());
        return jobRepository.save(job);
    }

    @Override
    public ContentGenerationJob markRunning(ContentGenerationJob job) {
        job.setStatus(JobStatus.RUNNING);
        return jobRepository.save(job);
    }

    @Override
    public ContentGenerationJob markDone(ContentGenerationJob job, Post post) {
        job.setStatus(JobStatus.DONE);
        job.setFinishedAt(LocalDateTime.now());
        job.setPost(post);
        return jobRepository.save(job);
    }

    @Override
    public ContentGenerationJob markFailed(ContentGenerationJob job, String errorMessage) {
        job.setStatus(JobStatus.FAILED);
        job.setFinishedAt(LocalDateTime.now());
        job.setErrorMessage(errorMessage);
        return jobRepository.save(job);
    }

    @Override
    public List<JobStatusResponse> listAll() {
        return jobRepository.findAllByOrderByStartedAtDesc().stream()
                .map(JobStatusResponse::from)
                .toList();
    }
}
