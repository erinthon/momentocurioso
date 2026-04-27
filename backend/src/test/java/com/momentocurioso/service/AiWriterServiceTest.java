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
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class AiWriterServiceTest {

    @Mock
    private RestClient claudeRestClient;

    private AiWriterServiceImpl aiWriterService;

    @BeforeEach
    void setUp() {
        // apiKey field stays null → triggers mock content branch (no API call made)
        aiWriterService = new AiWriterServiceImpl(claudeRestClient, new ObjectMapper());
    }

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
}
