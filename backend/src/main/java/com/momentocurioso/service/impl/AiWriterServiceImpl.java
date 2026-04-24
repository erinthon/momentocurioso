package com.momentocurioso.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.ScrapedArticle;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.service.AiWriterService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiWriterServiceImpl implements AiWriterService {

    private static final int MAX_ARTICLES = 5;
    private static final int MAX_CONTENT_CHARS = 500;

    private final RestClient claudeRestClient;
    private final ObjectMapper objectMapper;

    @Value("${claude.model}")
    private String model;

    @Value("${claude.api-key:}")
    private String apiKey;

    public AiWriterServiceImpl(RestClient claudeRestClient, ObjectMapper objectMapper) {
        this.claudeRestClient = claudeRestClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public AiGeneratedContent generate(Topic topic, List<ScrapedArticle> articles) {
        if (apiKey == null || apiKey.isBlank()) {
            return mockContent(topic);
        }

        String prompt = buildPrompt(topic, articles);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "max_tokens", 2048,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        JsonNode response = claudeRestClient.post()
                .uri("/v1/messages")
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);

        String generatedText = response.path("content").get(0).path("text").asText();

        return parseGeneratedContent(generatedText);
    }

    private String buildPrompt(Topic topic, List<ScrapedArticle> articles) {
        String articlesSummary = articles.stream()
                .limit(MAX_ARTICLES)
                .map(a -> "Título: %s\nConteúdo: %s".formatted(
                        a.getTitle(),
                        truncate(a.getContent(), MAX_CONTENT_CHARS)))
                .collect(Collectors.joining("\n\n---\n\n"));

        return """
                Você é um redator para o blog "Momento Curioso", que escreve sobre %s.

                Com base nos artigos abaixo, escreva um post de blog em português do Brasil.
                Retorne APENAS um objeto JSON válido (sem markdown, sem explicações) com os campos:
                - "title": título do post (string, máximo 100 caracteres)
                - "summary": resumo do post (string, máximo 300 caracteres)
                - "content": conteúdo completo em HTML (string, parágrafos em <p>, subtítulos em <h2>)

                Artigos:
                %s
                """.formatted(topic.getName(), articlesSummary);
    }

    private AiGeneratedContent parseGeneratedContent(String text) {
        try {
            // Strip markdown code block if Claude wrapped the JSON
            String json = text.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```[a-z]*\\n?", "").replaceAll("```$", "").trim();
            }
            JsonNode node = objectMapper.readTree(json);
            return new AiGeneratedContent(
                    node.path("title").asText(),
                    node.path("summary").asText(),
                    node.path("content").asText()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI-generated content: " + e.getMessage(), e);
        }
    }

    private AiGeneratedContent mockContent(Topic topic) {
        return new AiGeneratedContent(
                "[MOCK] Post sobre " + topic.getName(),
                "Este é um resumo gerado localmente para desenvolvimento. Configure CLAUDE_API_KEY para conteúdo real.",
                "<p>Este é um post de exemplo gerado em modo mock (sem CLAUDE_API_KEY configurada).</p>"
                        + "<h2>Por que estou vendo isso?</h2>"
                        + "<p>A variável de ambiente <code>CLAUDE_API_KEY</code> não está definida. "
                        + "Adicione sua chave no <code>application-local.yml</code> para ativar a geração real.</p>"
        );
    }

    private String truncate(String text, int maxChars) {
        if (text == null) return "";
        return text.length() <= maxChars ? text : text.substring(0, maxChars) + "...";
    }
}
