package com.momentocurioso.service.impl;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.AiProvider;
import com.momentocurioso.entity.ScrapedArticle;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.repository.AiProviderRepository;
import com.momentocurioso.repository.PromptTemplateRepository;
import com.momentocurioso.service.AiWriterService;
import com.momentocurioso.service.strategy.LlmStrategy;
import com.momentocurioso.service.strategy.LlmStrategyFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AiWriterServiceImpl implements AiWriterService {

    private static final int MAX_ARTICLES = 5;
    private static final int MAX_CONTENT_CHARS = 500;

    private static final String FALLBACK_TEMPLATE =
            "Você é um redator para o blog \"Momento Curioso\", que escreve sobre {{topic_name}}.\n\n" +
            "Com base nos artigos abaixo, escreva um post de blog em português do Brasil.\n" +
            "Retorne APENAS um objeto JSON válido (sem markdown, sem explicações) com os campos:\n" +
            "- \"title\": título do post (string, máximo 100 caracteres)\n" +
            "- \"summary\": resumo do post (string, máximo 300 caracteres)\n" +
            "- \"content\": conteúdo completo em HTML (string, parágrafos em <p>, subtítulos em <h2>)\n\n" +
            "Artigos:\n{{articles}}";

    private final AiProviderRepository aiProviderRepository;
    private final PromptTemplateRepository promptTemplateRepository;
    private final LlmStrategyFactory strategyFactory;

    public AiWriterServiceImpl(AiProviderRepository aiProviderRepository,
                               PromptTemplateRepository promptTemplateRepository,
                               LlmStrategyFactory strategyFactory) {
        this.aiProviderRepository = aiProviderRepository;
        this.promptTemplateRepository = promptTemplateRepository;
        this.strategyFactory = strategyFactory;
    }

    @Override
    public AiGeneratedContent generate(Topic topic, List<ScrapedArticle> articles) {
        Optional<AiProvider> active = aiProviderRepository.findFirstByActiveTrue();
        if (active.isEmpty()) {
            return mockContent(topic);
        }
        return generate(topic, articles, active.get());
    }

    @Override
    public AiGeneratedContent generate(Topic topic, List<ScrapedArticle> articles, AiProvider provider) {
        String prompt = buildPrompt(topic, articles);
        LlmStrategy strategy = strategyFactory.create(provider);
        return strategy.generate(prompt);
    }

    @Override
    public AiGeneratedContent generateMock(Topic topic) {
        return mockContent(topic);
    }

    private String buildPrompt(Topic topic, List<ScrapedArticle> articles) {
        String articlesSummary = articles.stream()
                .limit(MAX_ARTICLES)
                .map(a -> "Título: %s\nConteúdo: %s".formatted(
                        a.getTitle(),
                        truncate(a.getContent(), MAX_CONTENT_CHARS)))
                .collect(Collectors.joining("\n\n---\n\n"));

        String template = promptTemplateRepository.findFirstByIsDefaultTrue()
                .map(com.momentocurioso.entity.PromptTemplate::getTemplate)
                .orElse(FALLBACK_TEMPLATE);

        return template
                .replace("{{topic_name}}", topic.getName())
                .replace("{{articles}}", articlesSummary);
    }

    private AiGeneratedContent mockContent(Topic topic) {
        return new AiGeneratedContent(
                "[MOCK] Post sobre " + topic.getName(),
                "Este é um resumo gerado localmente para desenvolvimento. Configure um provider ativo para conteúdo real.",
                "<p>Este é um post de exemplo gerado em modo mock (sem provider ativo configurado).</p>"
                        + "<h2>Por que estou vendo isso?</h2>"
                        + "<p>Nenhum <code>AiProvider</code> está ativo. Acesse o painel de Providers e ative um para habilitar a geração real.</p>"
        );
    }

    private String truncate(String text, int maxChars) {
        if (text == null) return "";
        return text.length() <= maxChars ? text : text.substring(0, maxChars) + "...";
    }
}
