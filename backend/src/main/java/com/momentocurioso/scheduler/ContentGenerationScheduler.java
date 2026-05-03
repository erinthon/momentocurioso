package com.momentocurioso.scheduler;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.ApprovalStatus;
import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.ScrapedArticle;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.entity.TriggerSource;
import com.momentocurioso.repository.TopicRepository;
import com.momentocurioso.service.AiWriterService;
import com.momentocurioso.service.ContentFetcherService;
import com.momentocurioso.service.ContentGenerationJobService;
import com.momentocurioso.service.PostService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ContentGenerationScheduler {

    private static final Logger log = LoggerFactory.getLogger(ContentGenerationScheduler.class);

    private final TopicRepository topicRepository;
    private final ContentFetcherService contentFetcherService;
    private final AiWriterService aiWriterService;
    private final PostService postService;
    private final ContentGenerationJobService jobService;

    public ContentGenerationScheduler(TopicRepository topicRepository,
                                      ContentFetcherService contentFetcherService,
                                      AiWriterService aiWriterService,
                                      PostService postService,
                                      ContentGenerationJobService jobService) {
        this.topicRepository = topicRepository;
        this.contentFetcherService = contentFetcherService;
        this.aiWriterService = aiWriterService;
        this.postService = postService;
        this.jobService = jobService;
    }

    @Scheduled(fixedDelayString = "${scheduler.content-generation.delay-ms:21600000}",
               initialDelayString = "${scheduler.content-generation.initial-delay-ms:60000}")
    public void run() {
        List<Topic> activeTopics = topicRepository.findAllByActiveTrue();
        log.info("Content generation scheduler triggered — {} active topic(s)", activeTopics.size());

        for (Topic topic : activeTopics) {
            runForTopic(topic, TriggerSource.SCHEDULER);
        }
    }

    public ContentGenerationJob runForTopic(Long topicId, TriggerSource triggerSource) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found: " + topicId));
        return runForTopic(topic, triggerSource);
    }

    public ContentGenerationJob runForTopic(Topic topic, TriggerSource triggerSource) {
        ContentGenerationJob job = jobService.createJob(topic, triggerSource);
        jobService.markRunning(job);

        int articlesFound = 0;
        try {
            List<ScrapedArticle> articles = contentFetcherService.fetchAndSave(topic);
            articlesFound = articles.size();

            List<ScrapedArticle> approved = articles.stream()
                    .filter(a -> a.getApprovalStatus() == ApprovalStatus.APPROVED)
                    .toList();
            long pendingCount = articles.stream()
                    .filter(a -> a.getApprovalStatus() == ApprovalStatus.PENDING)
                    .count();

            if (approved.isEmpty()) {
                String summary = pendingCount > 0
                        ? pendingCount + " artigo(s) aguardando aprovação"
                        : "Nenhum artigo novo encontrado";
                log.info("No approved articles for topic '{}' — {}", topic.getSlug(), summary);
                return jobService.markDone(job, null, articlesFound, 0, summary);
            }

            AiGeneratedContent content = aiWriterService.generate(topic, approved);
            contentFetcherService.markUsed(approved);
            Post post = postService.saveDraft(topic, content);
            log.info("Content generated for topic '{}' — post id={} articles={} status={}",
                    topic.getSlug(), post.getId(), approved.size(), post.getStatus());
            return jobService.markDone(job, post, articlesFound, approved.size());

        } catch (Exception e) {
            log.error("Content generation failed for topic '{}': {}", topic.getSlug(), e.getMessage(), e);
            return jobService.markFailed(job, e.getMessage(), articlesFound);
        }
    }
}
