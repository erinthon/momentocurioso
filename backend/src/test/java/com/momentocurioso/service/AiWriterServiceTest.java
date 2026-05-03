package com.momentocurioso.service;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.AiProvider;
import com.momentocurioso.entity.AiProviderType;
import com.momentocurioso.entity.ScrapedArticle;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.repository.AiProviderRepository;
import com.momentocurioso.service.impl.AiWriterServiceImpl;
import com.momentocurioso.service.strategy.LlmStrategy;
import com.momentocurioso.service.strategy.LlmStrategyFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiWriterServiceTest {

    @Mock
    private AiProviderRepository aiProviderRepository;

    @Mock
    private LlmStrategyFactory strategyFactory;

    @Mock
    private LlmStrategy llmStrategy;

    private AiWriterServiceImpl aiWriterService;

    @BeforeEach
    void setUp() {
        aiWriterService = new AiWriterServiceImpl(aiProviderRepository, strategyFactory);
    }

    // ── BUG-009: Testes sem @SpringBootTest — rodam sem MySQL ─────────────────

    @Test
    void generate_withNoActiveProvider_returnsMockContent() {
        when(aiProviderRepository.findFirstByActiveTrue()).thenReturn(Optional.empty());

        Topic topic = new Topic();
        topic.setName("IA");
        topic.setSlug("ia");

        AiGeneratedContent result = aiWriterService.generate(topic, List.of());

        assertThat(result.title()).isNotBlank();
        assertThat(result.summary()).isNotBlank();
        assertThat(result.content()).isNotBlank();
    }

    @Test
    void generate_withNoActiveProvider_andArticles_returnsMockContent() {
        when(aiProviderRepository.findFirstByActiveTrue()).thenReturn(Optional.empty());

        Topic topic = new Topic();
        topic.setName("Tecnologia");
        topic.setSlug("tecnologia");

        ScrapedArticle article = new ScrapedArticle();
        article.setTitle("Artigo de teste");
        article.setContent("Conteúdo do artigo de teste para verificar que mock ignora artigos.");

        AiGeneratedContent result = aiWriterService.generate(topic, List.of(article));

        assertThat(result.title()).isNotBlank();
        assertThat(result.summary()).isNotBlank();
        assertThat(result.content()).isNotBlank();
    }

    @Test
    void generate_withActiveProvider_delegatesToStrategy() {
        AiProvider provider = new AiProvider();
        provider.setName("Claude Test");
        provider.setType(AiProviderType.CLAUDE);
        provider.setModel("claude-sonnet-4-6");
        provider.setApiKey("test-api-key");

        when(aiProviderRepository.findFirstByActiveTrue()).thenReturn(Optional.of(provider));
        when(strategyFactory.create(provider)).thenReturn(llmStrategy);
        when(llmStrategy.generate(anyString())).thenReturn(
                new AiGeneratedContent("Título gerado", "Resumo gerado", "<p>Conteúdo gerado</p>")
        );

        Topic topic = new Topic();
        topic.setName("Tech");
        topic.setSlug("tech");

        AiGeneratedContent result = aiWriterService.generate(topic, List.of());

        verify(strategyFactory).create(provider);
        verify(llmStrategy).generate(any());
        assertThat(result.title()).isEqualTo("Título gerado");
    }

    @Test
    void generateMock_returnsMockContentWithTopicName() {
        Topic topic = new Topic();
        topic.setName("Tecnologia");
        topic.setSlug("tecnologia");

        AiGeneratedContent result = aiWriterService.generateMock(topic);

        assertThat(result.title()).contains("[MOCK]").contains("Tecnologia");
        assertThat(result.summary()).isNotBlank();
        assertThat(result.content()).isNotBlank();
    }

    @Test
    void generate_whenStrategyThrows_exceptionPropagates() {
        AiProvider provider = new AiProvider();
        provider.setName("Claude Test");
        provider.setType(AiProviderType.CLAUDE);
        provider.setModel("claude-sonnet-4-6");
        provider.setApiKey("test-api-key");

        when(aiProviderRepository.findFirstByActiveTrue()).thenReturn(Optional.of(provider));
        when(strategyFactory.create(provider)).thenReturn(llmStrategy);
        when(llmStrategy.generate(anyString())).thenThrow(new RuntimeException("API error"));

        Topic topic = new Topic();
        topic.setName("Tech");
        topic.setSlug("tech");

        assertThatThrownBy(() -> aiWriterService.generate(topic, List.of()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("API error");
    }
}
