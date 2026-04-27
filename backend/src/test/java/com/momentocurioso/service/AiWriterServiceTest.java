package com.momentocurioso.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.ScrapedArticle;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.service.impl.AiWriterServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AiWriterServiceTest {

    @Mock
    private RestClient claudeRestClient;

    private AiWriterServiceImpl aiWriterService;

    @BeforeEach
    void setUp() {
        // apiKey field stays null → triggers mock content branch (no API call made)
        aiWriterService = new AiWriterServiceImpl(claudeRestClient, new ObjectMapper());
    }

    // ── BUG-009: Testes sem @SpringBootTest — rodam sem MySQL ─────────────────

    @Test
    void generate_withoutApiKey_returnsMockContent() {
        Topic topic = new Topic();
        topic.setName("IA");
        topic.setSlug("ia");

        AiGeneratedContent result = aiWriterService.generate(topic, List.of());

        assertThat(result.title()).isNotBlank();
        assertThat(result.summary()).isNotBlank();
        assertThat(result.content()).isNotBlank();
    }

    @Test
    void generate_withArticles_withoutApiKey_returnsMockContent() {
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

    // ── BUG-016: Claude API com erros HTTP lança exceção com mensagem descritiva ──

    private void setupApiMode() {
        ReflectionTestUtils.setField(aiWriterService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(aiWriterService, "model", "claude-sonnet-4-6");
    }

    private RestClient.ResponseSpec stubRestClientChain(RuntimeException toThrow) {
        var uriSpec = mock(RestClient.RequestBodyUriSpec.class);
        var bodySpec = mock(RestClient.RequestBodySpec.class);
        var responseSpec = mock(RestClient.ResponseSpec.class);

        doReturn(uriSpec).when(claudeRestClient).post();
        doReturn(bodySpec).when(uriSpec).uri(anyString());
        doReturn(bodySpec).when(bodySpec).body(any(Object.class));
        doReturn(responseSpec).when(bodySpec).retrieve();
        doReturn(responseSpec).when(responseSpec).onStatus(any(), any());
        doThrow(toThrow).when(responseSpec).body(any(Class.class));

        return responseSpec;
    }

    @Test
    void generate_when429FromClaude_throwsExceptionWithRateLimitMessage() {
        setupApiMode();
        stubRestClientChain(new RuntimeException("Claude API: rate limit exceeded, try again later (429)"));

        Topic topic = new Topic();
        topic.setName("Tech");
        topic.setSlug("tech");

        assertThatThrownBy(() -> aiWriterService.generate(topic, List.of()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("rate limit");
    }

    @Test
    void generate_when401FromClaude_throwsExceptionWithUnauthorizedMessage() {
        setupApiMode();
        stubRestClientChain(new RuntimeException("Claude API: unauthorized — check your API key (401)"));

        Topic topic = new Topic();
        topic.setName("Tech");
        topic.setSlug("tech");

        assertThatThrownBy(() -> aiWriterService.generate(topic, List.of()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("401");
    }

    @Test
    void generate_when500FromClaude_throwsExceptionWithServerErrorMessage() {
        setupApiMode();
        stubRestClientChain(new RuntimeException("Claude API server error: 500 INTERNAL_SERVER_ERROR"));

        Topic topic = new Topic();
        topic.setName("Tech");
        topic.setSlug("tech");

        assertThatThrownBy(() -> aiWriterService.generate(topic, List.of()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("500");
    }
}
