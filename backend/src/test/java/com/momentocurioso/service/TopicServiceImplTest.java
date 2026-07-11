package com.momentocurioso.service;

import com.momentocurioso.dto.request.UpdateTopicRequest;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.repository.TopicRepository;
import com.momentocurioso.service.impl.TopicServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TopicServiceImplTest {

    @Mock
    private TopicRepository topicRepository;

    @InjectMocks
    private TopicServiceImpl topicService;

    private Topic buildTopic() {
        Topic topic = new Topic();
        topic.setId(1L);
        topic.setName("Ciência");
        topic.setSlug("ciencia");
        return topic;
    }

    // ── update: slug editável (opcional; valida unicidade) ──────────────────

    @Test
    void update_withNewUniqueSlug_changesSlug() {
        when(topicRepository.findById(1L)).thenReturn(Optional.of(buildTopic()));
        when(topicRepository.existsBySlug("ciencia-espaco")).thenReturn(false);
        when(topicRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = topicService.update(1L, new UpdateTopicRequest(
                "Ciência", null, false, true, "ciencia-espaco"));

        assertThat(response.slug()).isEqualTo("ciencia-espaco");
    }

    @Test
    void update_withDuplicateSlug_throwsIllegalArgumentException() {
        when(topicRepository.findById(1L)).thenReturn(Optional.of(buildTopic()));
        when(topicRepository.existsBySlug("historia")).thenReturn(true);

        assertThatThrownBy(() -> topicService.update(1L, new UpdateTopicRequest(
                "Ciência", null, false, true, "historia")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("historia");

        verify(topicRepository, never()).save(any());
    }

    @Test
    void update_withoutSlug_keepsExistingSlug() {
        when(topicRepository.findById(1L)).thenReturn(Optional.of(buildTopic()));
        when(topicRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = topicService.update(1L, new UpdateTopicRequest(
                "Ciência", null, false, true, null));

        assertThat(response.slug()).isEqualTo("ciencia");
        verify(topicRepository, never()).existsBySlug(any());
    }

    @Test
    void update_withSameSlug_doesNotCheckUniqueness() {
        when(topicRepository.findById(1L)).thenReturn(Optional.of(buildTopic()));
        when(topicRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = topicService.update(1L, new UpdateTopicRequest(
                "Ciência", null, false, true, "ciencia"));

        assertThat(response.slug()).isEqualTo("ciencia");
        verify(topicRepository, never()).existsBySlug(any());
    }
}
