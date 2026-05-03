package com.momentocurioso.scheduler;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.ScrapedArticle;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.entity.TriggerSource;
import com.momentocurioso.repository.TopicRepository;
import com.momentocurioso.service.AiWriterService;
import com.momentocurioso.service.ContentFetcherService;
import com.momentocurioso.service.ContentGenerationJobService;
import com.momentocurioso.service.FetchResult;
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
        int articlesSkipped = 0;
        try {
            FetchResult fetch = contentFetcherService.fetchAndSave(topic);
            List<ScrapedArticle> newArticles = fetch.articles();
            articlesFound = newArticles.size();
            articlesSkipped = fetch.skippedCount();

            if (topic.isRequireApproval()) {
                if (triggerSource == TriggerSource.MANUAL) {
                    List<ScrapedArticle> approvedToProcess = contentFetcherService.findApprovedUnused(topic);
                    if (!approvedToProcess.isEmpty()) {
                        AiGeneratedContent content = aiWriterService.generate(topic, approvedToProcess);
                        contentFetcherService.markUsed(approvedToProcess);
                        Post post = postService.saveDraft(topic, content);
                        String summary = approvedToProcess.size() + " artigo(s) aprovado(s) processado(s)";
                        if (articlesFound > 0) {
                            summary += " | " + articlesFound + " novo(s) artigo(s) aguardando aprovação";
                        }
                        log.info("Content generated for requireApproval topic '{}' — post id={} approvedArticles={}",
                                topic.getSlug(), post.getId(), approvedToProcess.size());
                        return jobService.markDone(job, post,
                                articlesFound + approvedToProcess.size(), approvedToProcess.size(), articlesSkipped, summary);
                    }
                }
                String summary = articlesFound > 0
                        ? articlesFound + " artigo(s) aguardando aprovação"
                        : "Nenhum artigo novo encontrado";
                log.info("Skipping AI for requireApproval topic '{}' — {}", topic.getSlug(), summary);
                return jobService.markDone(job, null, articlesFound, 0, articlesSkipped, summary);
            }

            // requireApproval=false: standard flow
            if (newArticles.isEmpty()) {
                log.info("No new articles for topic '{}' — skipping generation", topic.getSlug());
                return jobService.markDone(job, null, 0, 0, articlesSkipped);
            }

            AiGeneratedContent content = aiWriterService.generate(topic, newArticles);
            contentFetcherService.markUsed(newArticles);
            Post post = postService.saveDraft(topic, content);
            log.info("Content generated for topic '{}' — post id={} articles={} status={}",
                    topic.getSlug(), post.getId(), newArticles.size(), post.getStatus());
            return jobService.markDone(job, post, newArticles.size(), newArticles.size(), articlesSkipped);

        } catch (Exception e) {
            log.error("Content generation failed for topic '{}': {}", topic.getSlug(), e.getMessage(), e);
            return jobService.markFailed(job, e.getMessage(), articlesFound, articlesSkipped);
        }
    }
}
