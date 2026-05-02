package com.momentocurioso.service.strategy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.AiProvider;

public class OpenAiCompatibleStrategy implements LlmStrategy {

    private final OpenAiStrategy delegate;

    OpenAiCompatibleStrategy(AiProvider provider, ObjectMapper objectMapper) {
        this.delegate = new OpenAiStrategy(provider, objectMapper, provider.getBaseUrl());
    }

    @Override
    public AiGeneratedContent generate(String prompt) {
        return delegate.generate(prompt);
    }
}
