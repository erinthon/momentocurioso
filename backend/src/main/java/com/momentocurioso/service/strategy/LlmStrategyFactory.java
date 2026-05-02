package com.momentocurioso.service.strategy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.entity.AiProvider;
import org.springframework.stereotype.Component;

@Component
public class LlmStrategyFactory {

    private final ObjectMapper objectMapper;

    public LlmStrategyFactory(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public LlmStrategy create(AiProvider provider) {
        return switch (provider.getType()) {
            case CLAUDE -> new ClaudeStrategy(provider, objectMapper);
            case OPENAI -> new OpenAiStrategy(provider, objectMapper);
            case OPENAI_COMPATIBLE -> new OpenAiCompatibleStrategy(provider, objectMapper);
        };
    }
}
