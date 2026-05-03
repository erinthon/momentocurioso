package com.momentocurioso.service.impl;

import com.momentocurioso.dto.response.JobStatusResponse;
import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.JobStatus;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.entity.TriggerSource;
import com.momentocurioso.repository.ContentGenerationJobRepository;
import com.momentocurioso.service.ContentGenerationJobService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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
    public ContentGenerationJob markDone(ContentGenerationJob job, Post post, int articlesFound, int articlesUsed, int articlesSkipped) {
        job.setStatus(JobStatus.DONE);
        job.setFinishedAt(LocalDateTime.now());
        job.setPost(post);
        job.setArticlesFound(articlesFound);
        job.setArticlesUsed(articlesUsed);
        job.setArticlesSkipped(articlesSkipped);
        if (articlesFound == 0) {
            job.setSummary(buildSuffix("Nenhum artigo novo encontrado", articlesSkipped));
        } else {
            job.setSummary(buildSuffix(articlesUsed + " artigo(s) coletado(s) · rascunho #" + post.getId() + " gerado", articlesSkipped));
        }
        return jobRepository.save(job);
    }

    @Override
    public ContentGenerationJob markDone(ContentGenerationJob job, Post post, int articlesFound, int articlesUsed, int articlesSkipped, String summary) {
        job.setStatus(JobStatus.DONE);
        job.setFinishedAt(LocalDateTime.now());
        job.setPost(post);
        job.setArticlesFound(articlesFound);
        job.setArticlesUsed(articlesUsed);
        job.setArticlesSkipped(articlesSkipped);
        job.setSummary(buildSuffix(summary, articlesSkipped));
        return jobRepository.save(job);
    }

    @Override
    public ContentGenerationJob markFailed(ContentGenerationJob job, String errorMessage, int articlesFound, int articlesSkipped) {
        job.setStatus(JobStatus.FAILED);
        job.setFinishedAt(LocalDateTime.now());
        job.setErrorMessage(errorMessage);
        job.setArticlesFound(articlesFound);
        job.setArticlesUsed(0);
        job.setArticlesSkipped(articlesSkipped);
        String base = articlesFound > 0
                ? articlesFound + " artigo(s) coletado(s) · falha na geração pela IA"
                : "Falha antes da coleta de artigos";
        job.setSummary(buildSuffix(base, articlesSkipped));
        return jobRepository.save(job);
    }

    @Override
    public PageResponse<JobStatusResponse> listAllAdmin(JobStatus status, Pageable pageable) {
        PageRequest pageRequest = PageRequest.of(
                pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "startedAt"));
        var page = status != null
                ? jobRepository.findAllByStatusOrderByStartedAtDesc(status, pageRequest)
                : jobRepository.findAllByOrderByStartedAtDesc(pageRequest);
        return PageResponse.from(page.map(JobStatusResponse::from));
    }

    private String buildSuffix(String base, int skipped) {
        if (skipped > 0) {
            return base + " · " + skipped + " ignorado(s) (duplicatas)";
        }
        return base;
    }
}
