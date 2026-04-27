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
import com.momentocurioso.service.PostService;
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

    @Scheduled(fixedRateString = "${scheduler.content-generation.rate-ms:21600000}",
               initialDelayString = "${scheduler.content-generation.initial-delay-ms:60000}")
    public void run() {
        List<Topic> activeTopics = topicRepository.findAllByActiveTrue();
        log.info("Content generation scheduler triggered — {} active topic(s)", activeTopics.size());

        for (Topic topic : activeTopics) {
            runForTopic(topic, TriggerSource.SCHEDULER);
        }
    }

    public ContentGenerationJob runForTopic(Topic topic, TriggerSource triggerSource) {
        ContentGenerationJob job = jobService.createJob(topic, triggerSource);
        jobService.markRunning(job);

        try {
            List<ScrapedArticle> articles = contentFetcherService.fetchAndSave(topic);

            if (articles.isEmpty()) {
                log.info("No new articles for topic '{}' — skipping generation", topic.getSlug());
                return jobService.markDone(job, null);
            }

            AiGeneratedContent content = aiWriterService.generate(topic, articles);
            Post post = postService.saveDraft(topic, content);
            log.info("Content generated for topic '{}' — post id={} status={}", topic.getSlug(), post.getId(), post.getStatus());
            return jobService.markDone(job, post);

        } catch (Exception e) {
            log.error("Content generation failed for topic '{}': {}", topic.getSlug(), e.getMessage(), e);
            return jobService.markFailed(job, e.getMessage());
        }
    }
}
