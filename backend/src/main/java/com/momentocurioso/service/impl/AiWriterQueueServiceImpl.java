package com.momentocurioso.service.impl;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.dto.request.GenerateFromQueueRequest;
import com.momentocurioso.dto.response.JobStatusResponse;
import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.ScrapedArticleResponse;
import com.momentocurioso.entity.AiProvider;
import com.momentocurioso.entity.ApprovalStatus;
import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.ScrapedArticle;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.entity.TriggerSource;
import com.momentocurioso.repository.AiProviderRepository;
import com.momentocurioso.repository.ScrapedArticleRepository;
import com.momentocurioso.repository.TopicRepository;
import com.momentocurioso.service.AiWriterQueueService;
import com.momentocurioso.service.AiWriterService;
import com.momentocurioso.service.ContentFetcherService;
import com.momentocurioso.service.ContentGenerationJobService;
import com.momentocurioso.service.PostService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiWriterQueueServiceImpl implements AiWriterQueueService {

    private final ScrapedArticleRepository scrapedArticleRepository;
    private final TopicRepository topicRepository;
    private final AiProviderRepository aiProviderRepository;
    private final AiWriterService aiWriterService;
    private final PostService postService;
    private final ContentFetcherService contentFetcherService;
    private final ContentGenerationJobService jobService;

    public AiWriterQueueServiceImpl(
            ScrapedArticleRepository scrapedArticleRepository,
            TopicRepository topicRepository,
            AiProviderRepository aiProviderRepository,
            AiWriterService aiWriterService,
            PostService postService,
            ContentFetcherService contentFetcherService,
            ContentGenerationJobService jobService) {
        this.scrapedArticleRepository = scrapedArticleRepository;
        this.topicRepository = topicRepository;
        this.aiProviderRepository = aiProviderRepository;
        this.aiWriterService = aiWriterService;
        this.postService = postService;
        this.contentFetcherService = contentFetcherService;
        this.jobService = jobService;
    }

    @Override
    public PageResponse<ScrapedArticleResponse> listQueue(Pageable pageable) {
        return PageResponse.from(
                scrapedArticleRepository.findAllByApprovalStatus(ApprovalStatus.QUEUED, pageable)
                        .map(ScrapedArticleResponse::from)
        );
    }

    @Override
    public JobStatusResponse generateFromQueue(GenerateFromQueueRequest req) {
        Topic topic = topicRepository.findById(req.topicId())
                .orElseThrow(() -> new EntityNotFoundException("Topic not found: " + req.topicId()));

        AiProvider provider = null;
        if (!req.mock()) {
            provider = aiProviderRepository.findById(req.aiProviderId())
                    .orElseThrow(() -> new EntityNotFoundException("AiProvider not found: " + req.aiProviderId()));
        }

        List<ScrapedArticle> articles = scrapedArticleRepository.findAllByIdIn(req.articleIds());
        List<ScrapedArticle> queued = articles.stream()
                .filter(a -> a.getApprovalStatus() == ApprovalStatus.QUEUED)
                .toList();

        if (queued.isEmpty()) {
            throw new IllegalStateException("Nenhum artigo QUEUED encontrado nos IDs fornecidos");
        }

        ContentGenerationJob job = jobService.createJob(topic, TriggerSource.MANUAL);
        jobService.markRunning(job);

        try {
            AiGeneratedContent content = req.mock()
                    ? aiWriterService.generateMock(topic)
                    : aiWriterService.generate(topic, queued, provider);
            Post post = postService.saveDraft(topic, content);

            contentFetcherService.markUsed(queued);
            queued.forEach(a -> a.setApprovalStatus(ApprovalStatus.APPROVED));
            scrapedArticleRepository.saveAll(queued);

            return JobStatusResponse.from(jobService.markDone(job, post, queued.size(), queued.size(), 0));
        } catch (Exception e) {
            return JobStatusResponse.from(jobService.markFailed(job, e.getMessage(), queued.size(), 0));
        }
    }
}
