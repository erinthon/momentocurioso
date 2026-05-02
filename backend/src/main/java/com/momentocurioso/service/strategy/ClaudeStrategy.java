package com.momentocurioso.service.strategy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.AiProvider;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

public class ClaudeStrategy implements LlmStrategy {

    private final AiProvider provider;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    ClaudeStrategy(AiProvider provider, ObjectMapper objectMapper) {
        this(provider, objectMapper, RestClient.builder()
                .baseUrl("https://api.anthropic.com")
                .defaultHeader("x-api-key", provider.getApiKey())
                .defaultHeader("anthropic-version", "2023-06-01")
                .defaultHeader("content-type", "application/json")
                .build());
    }

    ClaudeStrategy(AiProvider provider, ObjectMapper objectMapper, RestClient restClient) {
        this.provider = provider;
        this.objectMapper = objectMapper;
        this.restClient = restClient;
    }

    @Override
    public AiGeneratedContent generate(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", provider.getModel(),
                "max_tokens", 2048,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        JsonNode response = restClient.post()
                .uri("/v1/messages")
                .body(requestBody)
                .retrieve()
                .onStatus(status -> status.value() == 401,
                        (req, res) -> { throw new RuntimeException("Claude API: unauthorized — check your API key (401)"); })
                .onStatus(status -> status.value() == 429,
                        (req, res) -> { throw new RuntimeException("Claude API: rate limit exceeded, try again later (429)"); })
                .onStatus(HttpStatusCode::is5xxServerError,
                        (req, res) -> { throw new RuntimeException("Claude API server error: " + res.getStatusCode()); })
                .body(JsonNode.class);

        String text = response.path("content").get(0).path("text").asText();
        return LlmStrategy.parseContent(text, objectMapper);
    }
}
