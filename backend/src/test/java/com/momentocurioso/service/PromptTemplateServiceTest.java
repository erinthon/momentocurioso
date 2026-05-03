package com.momentocurioso.service;

import com.momentocurioso.dto.request.CreatePromptTemplateRequest;
import com.momentocurioso.dto.request.UpdatePromptTemplateRequest;
import com.momentocurioso.dto.response.PromptTemplateResponse;
import com.momentocurioso.entity.PromptTemplate;
import com.momentocurioso.repository.PromptTemplateRepository;
import com.momentocurioso.service.impl.PromptTemplateServiceImpl;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromptTemplateServiceTest {

    @Mock
    private PromptTemplateRepository promptTemplateRepository;

    private PromptTemplateServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PromptTemplateServiceImpl(promptTemplateRepository);
    }

    private PromptTemplate buildTemplate(Long id, String name, boolean isDefault) {
        PromptTemplate pt = new PromptTemplate();
        pt.setId(id);
        pt.setName(name);
        pt.setTemplate("Texto do template {{topic_name}} {{articles}}");
        pt.setDefault(isDefault);
        pt.setCreatedAt(LocalDateTime.now());
        pt.setUpdatedAt(LocalDateTime.now());
        return pt;
    }

    @Test
    void findAll_returnsAllTemplates() {
        when(promptTemplateRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(List.of(buildTemplate(1L, "A", true), buildTemplate(2L, "B", false)));

        List<PromptTemplateResponse> result = service.findAll();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).name()).isEqualTo("A");
    }

    @Test
    void create_savesAndReturnsDto() {
        PromptTemplate saved = buildTemplate(1L, "Novo", false);
        when(promptTemplateRepository.count()).thenReturn(1L);
        when(promptTemplateRepository.save(any())).thenReturn(saved);

        PromptTemplateResponse result = service.create(new CreatePromptTemplateRequest("Novo", "template text"));

        assertThat(result.name()).isEqualTo("Novo");
        verify(promptTemplateRepository).save(any());
    }

    @Test
    void create_firstTemplate_setsDefault() {
        PromptTemplate saved = buildTemplate(1L, "Primeiro", true);
        when(promptTemplateRepository.count()).thenReturn(0L);
        when(promptTemplateRepository.save(any())).thenReturn(saved);

        PromptTemplateResponse result = service.create(new CreatePromptTemplateRequest("Primeiro", "text"));

        assertThat(result.isDefault()).isTrue();
    }

    @Test
    void update_existingTemplate_updatesAndReturns() {
        PromptTemplate existing = buildTemplate(1L, "Old", false);
        PromptTemplate updated = buildTemplate(1L, "New", false);
        updated.setTemplate("new text");
        when(promptTemplateRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(promptTemplateRepository.save(any())).thenReturn(updated);

        PromptTemplateResponse result = service.update(1L, new UpdatePromptTemplateRequest("New", "new text"));

        assertThat(result.name()).isEqualTo("New");
    }

    @Test
    void update_notFound_throwsEntityNotFoundException() {
        when(promptTemplateRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(99L, new UpdatePromptTemplateRequest("X", "y")))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void delete_nonDefault_deletesSuccessfully() {
        PromptTemplate pt = buildTemplate(2L, "B", false);
        when(promptTemplateRepository.findById(2L)).thenReturn(Optional.of(pt));

        service.delete(2L);

        verify(promptTemplateRepository).deleteById(2L);
    }

    @Test
    void delete_defaultTemplate_throwsIllegalStateException() {
        PromptTemplate pt = buildTemplate(1L, "Padrão", true);
        when(promptTemplateRepository.findById(1L)).thenReturn(Optional.of(pt));

        assertThatThrownBy(() -> service.delete(1L))
                .isInstanceOf(IllegalStateException.class);
        verify(promptTemplateRepository, never()).deleteById(any());
    }

    @Test
    void delete_notFound_throwsEntityNotFoundException() {
        when(promptTemplateRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void setDefault_clearsOldAndSetsNew() {
        PromptTemplate pt = buildTemplate(2L, "B", false);
        when(promptTemplateRepository.findById(2L)).thenReturn(Optional.of(pt));
        when(promptTemplateRepository.save(any())).thenReturn(buildTemplate(2L, "B", true));

        PromptTemplateResponse result = service.setDefault(2L);

        verify(promptTemplateRepository).clearDefault();
        assertThat(result.isDefault()).isTrue();
    }

    @Test
    void setDefault_notFound_throwsEntityNotFoundException() {
        when(promptTemplateRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.setDefault(99L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
