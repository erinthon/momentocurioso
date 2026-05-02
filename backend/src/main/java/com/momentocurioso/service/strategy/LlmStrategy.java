package com.momentocurioso.service.strategy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.AiGeneratedContent;

public interface LlmStrategy {

    AiGeneratedContent generate(String prompt);

    static AiGeneratedContent parseContent(String text, ObjectMapper objectMapper) {
        try {
            String json = text.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```[a-z]*\\n?", "").replaceAll("```$", "").trim();
            }
            var node = objectMapper.readTree(json);
            return new AiGeneratedContent(
                    node.path("title").asText(),
                    node.path("summary").asText(),
                    node.path("content").asText()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI-generated content: " + e.getMessage(), e);
        }
    }
}
