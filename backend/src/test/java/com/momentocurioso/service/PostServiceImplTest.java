package com.momentocurioso.service;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.repository.PostRepository;
import com.momentocurioso.service.impl.PostServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceImplTest {

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private PostServiceImpl postService;

    private Post buildPost(Long id, PostStatus status) {
        Topic topic = new Topic();
        topic.setId(1L);
        topic.setName("Tecnologia");
        topic.setSlug("tecnologia");

        Post post = new Post();
        post.setId(id);
        post.setTitle("Título de Teste");
        post.setSlug("titulo-de-teste");
        post.setSummary("Resumo de teste");
        post.setContent("<p>Conteúdo de teste</p>");
        post.setStatus(status);
        post.setTopic(topic);
        return post;
    }

    // ── BUG-002: approve/reject devem bloquear posts que não são DRAFT ──────

    @Test
    void approve_whenDraft_setsStatusPublishedAndFillsPublishedAt() {
        Post post = buildPost(1L, PostStatus.DRAFT);
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = postService.approve(1L);

        assertThat(response.publishedAt()).isNotNull();
        verify(postRepository).save(argThat(p -> p.getStatus() == PostStatus.PUBLISHED));
    }

    @Test
    void approve_whenPublished_throwsIllegalStateException() {
        Post post = buildPost(1L, PostStatus.PUBLISHED);
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> postService.approve(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already published");
    }

    @Test
    void approve_whenRejected_setsStatusPublished() {
        Post post = buildPost(1L, PostStatus.REJECTED);
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = postService.approve(1L);

        assertThat(response.status()).isEqualTo(PostStatus.PUBLISHED);
        assertThat(response.publishedAt()).isNotNull();
        verify(postRepository).save(argThat(p -> p.getStatus() == PostStatus.PUBLISHED));
    }

    @Test
    void reject_whenDraft_setsStatusRejected() {
        Post post = buildPost(1L, PostStatus.DRAFT);
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        postService.reject(1L);

        verify(postRepository).save(argThat(p -> p.getStatus() == PostStatus.REJECTED));
    }

    @Test
    void reject_whenPublished_throwsIllegalStateException() {
        Post post = buildPost(1L, PostStatus.PUBLISHED);
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> postService.reject(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("DRAFT");
    }

    @Test
    void reject_whenRejected_throwsIllegalStateException() {
        Post post = buildPost(1L, PostStatus.REJECTED);
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> postService.reject(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("DRAFT");
    }

    // ── BUG-013: Slug race condition — retry com sufixo UUID ─────────────────

    @Test
    void saveDraft_onFirstSaveThrowsDataIntegrityViolation_retriesWithUuidSuffix() {
        Topic topic = new Topic();
        topic.setId(1L);
        topic.setSlug("tech");
        topic.setName("Tech");
        topic.setAutoPublish(false);

        when(postRepository.existsBySlug(any())).thenReturn(false);
        when(postRepository.save(any()))
                .thenThrow(new DataIntegrityViolationException("slug duplicate"))
                .thenAnswer(inv -> inv.getArgument(0));

        AiGeneratedContent content = new AiGeneratedContent("Titulo Unico", "Resumo", "<p>Conteudo</p>");
        Post result = postService.saveDraft(topic, content);

        assertThat(result.getSlug()).matches("titulo-unico-[0-9a-f]{8}");
        verify(postRepository, times(2)).save(any());
    }

    @Test
    void saveDraft_onSuccess_persistsPostWithGeneratedSlug() {
        Topic topic = new Topic();
        topic.setId(1L);
        topic.setSlug("tech");
        topic.setName("Tech");
        topic.setAutoPublish(false);

        when(postRepository.existsBySlug(any())).thenReturn(false);
        when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AiGeneratedContent content = new AiGeneratedContent("Artigo Incrivel", "Resumo", "<p>Conteudo</p>");
        Post result = postService.saveDraft(topic, content);

        assertThat(result.getSlug()).isEqualTo("artigo-incrivel");
        assertThat(result.getStatus()).isEqualTo(PostStatus.DRAFT);
        verify(postRepository, times(1)).save(any());
    }
}
