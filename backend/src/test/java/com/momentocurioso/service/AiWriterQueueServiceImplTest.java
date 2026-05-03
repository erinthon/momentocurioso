package com.momentocurioso.service;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.dto.request.GenerateFromQueueRequest;
import com.momentocurioso.dto.response.JobStatusResponse;
import com.momentocurioso.entity.*;
import com.momentocurioso.repository.AiProviderRepository;
import com.momentocurioso.repository.ScrapedArticleRepository;
import com.momentocurioso.repository.TopicRepository;
import com.momentocurioso.service.impl.AiWriterQueueServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiWriterQueueServiceImplTest {

    @Mock private ScrapedArticleRepository scrapedArticleRepository;
    @Mock private TopicRepository topicRepository;
    @Mock private AiProviderRepository aiProviderRepository;
    @Mock private AiWriterService aiWriterService;
    @Mock private PostService postService;
    @Mock private ContentFetcherService contentFetcherService;
    @Mock private ContentGenerationJobService jobService;

    private AiWriterQueueServiceImpl service;

    private Topic topic;
    private ContentGenerationJob job;
    private ScrapedArticle article;

    @BeforeEach
    void setUp() {
        service = new AiWriterQueueServiceImpl(
                scrapedArticleRepository, topicRepository, aiProviderRepository,
                aiWriterService, postService, contentFetcherService, jobService);

        topic = new Topic();
        topic.setId(1L);
        topic.setName("Tecnologia");
        topic.setSlug("tecnologia");

        job = new ContentGenerationJob();
        job.setId(10L);
        job.setTopic(topic);
        job.setStatus(JobStatus.DONE);
        job.setTriggeredBy(TriggerSource.MANUAL);
        job.setStartedAt(LocalDateTime.now());
        job.setArticlesFound(1);
        job.setArticlesUsed(1);
        job.setArticlesSkipped(0);

        article = new ScrapedArticle();
        article.setId(5L);
        article.setTitle("Artigo de Teste");
        article.setContent("Conteúdo do artigo");
        article.setApprovalStatus(ApprovalStatus.QUEUED);
    }

    @Test
    void generateFromQueue_whenMockTrue_callsGenerateMockNotLLM() {
        GenerateFromQueueRequest req = new GenerateFromQueueRequest(1L, null, List.of(5L), true);

        when(topicRepository.findById(1L)).thenReturn(Optional.of(topic));
        when(scrapedArticleRepository.findAllByIdIn(List.of(5L))).thenReturn(List.of(article));
        when(jobService.createJob(topic, TriggerSource.MANUAL)).thenReturn(job);
        when(jobService.markRunning(job)).thenReturn(job);
        when(aiWriterService.generateMock(topic))
                .thenReturn(new AiGeneratedContent("[MOCK] Título", "Resumo mock", "<p>Conteúdo mock</p>"));
        Post post = new Post(); post.setId(99L); post.setTopic(topic);
        when(postService.saveDraft(eq(topic), any())).thenReturn(post);
        job.setPost(post);
        when(jobService.markDone(eq(job), eq(post), eq(1), eq(1), eq(0))).thenReturn(job);

        service.generateFromQueue(req);

        verify(aiWriterService).generateMock(topic);
        verify(aiWriterService, never()).generate(any(Topic.class), anyList(), any(AiProvider.class));
        verify(aiProviderRepository, never()).findById(anyLong());
    }

    @Test
    void generateFromQueue_whenMockTrue_savesPostAndMarksArticlesApproved() {
        GenerateFromQueueRequest req = new GenerateFromQueueRequest(1L, null, List.of(5L), true);

        when(topicRepository.findById(1L)).thenReturn(Optional.of(topic));
        when(scrapedArticleRepository.findAllByIdIn(List.of(5L))).thenReturn(List.of(article));
        when(jobService.createJob(topic, TriggerSource.MANUAL)).thenReturn(job);
        when(jobService.markRunning(job)).thenReturn(job);
        when(aiWriterService.generateMock(topic))
                .thenReturn(new AiGeneratedContent("[MOCK] Título", "Resumo", "<p>Conteúdo</p>"));
        Post post = new Post(); post.setId(77L); post.setTopic(topic);
        when(postService.saveDraft(eq(topic), any())).thenReturn(post);
        job.setPost(post);
        when(jobService.markDone(eq(job), eq(post), eq(1), eq(1), eq(0))).thenReturn(job);

        JobStatusResponse result = service.generateFromQueue(req);

        verify(postService).saveDraft(eq(topic), any());
        verify(scrapedArticleRepository).saveAll(anyList());
        assertThat(article.getApprovalStatus()).isEqualTo(ApprovalStatus.APPROVED);
        assertThat(result.status()).isEqualTo(JobStatus.DONE);
    }

    @Test
    void generateFromQueue_whenMockFalse_callsRealGenerate() {
        AiProvider provider = new AiProvider();
        provider.setId(2L);
        provider.setName("Claude");

        GenerateFromQueueRequest req = new GenerateFromQueueRequest(1L, 2L, List.of(5L), false);

        when(topicRepository.findById(1L)).thenReturn(Optional.of(topic));
        when(aiProviderRepository.findById(2L)).thenReturn(Optional.of(provider));
        when(scrapedArticleRepository.findAllByIdIn(List.of(5L))).thenReturn(List.of(article));
        when(jobService.createJob(topic, TriggerSource.MANUAL)).thenReturn(job);
        when(jobService.markRunning(job)).thenReturn(job);
        when(aiWriterService.generate(eq(topic), anyList(), eq(provider)))
                .thenReturn(new AiGeneratedContent("Título Real", "Resumo", "<p>Conteúdo</p>"));
        Post post = new Post(); post.setId(88L); post.setTopic(topic);
        when(postService.saveDraft(eq(topic), any())).thenReturn(post);
        job.setPost(post);
        when(jobService.markDone(eq(job), eq(post), eq(1), eq(1), eq(0))).thenReturn(job);

        service.generateFromQueue(req);

        verify(aiWriterService).generate(eq(topic), anyList(), eq(provider));
        verify(aiWriterService, never()).generateMock(any());
    }

    @Test
    void generateFromQueue_whenMockTrueAndNoProvider_doesNotThrowEntityNotFound() {
        GenerateFromQueueRequest req = new GenerateFromQueueRequest(1L, null, List.of(5L), true);

        when(topicRepository.findById(1L)).thenReturn(Optional.of(topic));
        when(scrapedArticleRepository.findAllByIdIn(List.of(5L))).thenReturn(List.of(article));
        when(jobService.createJob(topic, TriggerSource.MANUAL)).thenReturn(job);
        when(jobService.markRunning(job)).thenReturn(job);
        when(aiWriterService.generateMock(topic))
                .thenReturn(new AiGeneratedContent("[MOCK]", "r", "<p>c</p>"));
        Post post = new Post(); post.setId(1L); post.setTopic(topic);
        when(postService.saveDraft(any(), any())).thenReturn(post);
        job.setPost(post);
        when(jobService.markDone(any(), any(), anyInt(), anyInt(), anyInt())).thenReturn(job);

        // deve executar sem EntityNotFoundException
        JobStatusResponse result = service.generateFromQueue(req);
        assertThat(result).isNotNull();
        verify(aiProviderRepository, never()).findById(anyLong());
    }

    @Test
    void generateFromQueue_whenNoQueuedArticles_throwsIllegalState() {
        ScrapedArticle approved = new ScrapedArticle();
        approved.setId(5L);
        approved.setApprovalStatus(ApprovalStatus.APPROVED);

        GenerateFromQueueRequest req = new GenerateFromQueueRequest(1L, null, List.of(5L), true);

        when(topicRepository.findById(1L)).thenReturn(Optional.of(topic));
        when(scrapedArticleRepository.findAllByIdIn(List.of(5L))).thenReturn(List.of(approved));

        assertThatThrownBy(() -> service.generateFromQueue(req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Nenhum artigo QUEUED");
    }
}
