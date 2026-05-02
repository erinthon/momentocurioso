package com.momentocurioso.service.strategy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.AiProvider;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

public class OpenAiStrategy implements LlmStrategy {

    private final AiProvider provider;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    OpenAiStrategy(AiProvider provider, ObjectMapper objectMapper) {
        this(provider, objectMapper, "https://api.openai.com");
    }

    OpenAiStrategy(AiProvider provider, ObjectMapper objectMapper, String baseUrl) {
        this.provider = provider;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + provider.getApiKey())
                .defaultHeader("content-type", "application/json")
                .build();
    }

    @Override
    public AiGeneratedContent generate(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", provider.getModel(),
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        JsonNode response = restClient.post()
                .uri("/v1/chat/completions")
                .body(requestBody)
                .retrieve()
                .onStatus(status -> status.value() == 401,
                        (req, res) -> { throw new RuntimeException("OpenAI API: unauthorized — check your API key (401)"); })
                .onStatus(status -> status.value() == 429,
                        (req, res) -> { throw new RuntimeException("OpenAI API: rate limit exceeded, try again later (429)"); })
                .onStatus(HttpStatusCode::is5xxServerError,
                        (req, res) -> { throw new RuntimeException("OpenAI API server error: " + res.getStatusCode()); })
                .body(JsonNode.class);

        String text = response.path("choices").get(0).path("message").path("content").asText();
        return LlmStrategy.parseContent(text, objectMapper);
    }
}
