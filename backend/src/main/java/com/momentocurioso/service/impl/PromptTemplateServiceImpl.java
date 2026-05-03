package com.momentocurioso.service.impl;

import com.momentocurioso.dto.request.CreatePromptTemplateRequest;
import com.momentocurioso.dto.request.UpdatePromptTemplateRequest;
import com.momentocurioso.dto.response.PromptTemplateResponse;
import com.momentocurioso.entity.PromptTemplate;
import com.momentocurioso.repository.PromptTemplateRepository;
import com.momentocurioso.service.PromptTemplateService;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PromptTemplateServiceImpl implements PromptTemplateService {

    static final String DEFAULT_TEMPLATE = """
            Você é um redator para o blog "Momento Curioso", que escreve sobre {{topic_name}}.

            Com base nos artigos abaixo, escreva um post de blog em português do Brasil.
            Retorne APENAS um objeto JSON válido (sem markdown, sem explicações) com os campos:
            - "title": título do post (string, máximo 100 caracteres)
            - "summary": resumo do post (string, máximo 300 caracteres)
            - "content": conteúdo completo em HTML (string, parágrafos em <p>, subtítulos em <h2>)

            Artigos:
            {{articles}}
            """;

    private final PromptTemplateRepository promptTemplateRepository;

    public PromptTemplateServiceImpl(PromptTemplateRepository promptTemplateRepository) {
        this.promptTemplateRepository = promptTemplateRepository;
    }

    @PostConstruct
    void seed() {
        if (promptTemplateRepository.count() == 0) {
            PromptTemplate seed = new PromptTemplate();
            seed.setName("Template Padrão");
            seed.setTemplate(DEFAULT_TEMPLATE.strip());
            seed.setDefault(true);
            promptTemplateRepository.save(seed);
        }
    }

    @Override
    public List<PromptTemplateResponse> findAll() {
        return promptTemplateRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PromptTemplateResponse::from)
                .toList();
    }

    @Override
    public PromptTemplateResponse create(CreatePromptTemplateRequest request) {
        PromptTemplate pt = new PromptTemplate();
        pt.setName(request.name());
        pt.setTemplate(request.template());
        if (promptTemplateRepository.count() == 0) {
            pt.setDefault(true);
        }
        return PromptTemplateResponse.from(promptTemplateRepository.save(pt));
    }

    @Override
    public PromptTemplateResponse update(Long id, UpdatePromptTemplateRequest request) {
        PromptTemplate pt = promptTemplateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PromptTemplate not found: " + id));
        pt.setName(request.name());
        pt.setTemplate(request.template());
        return PromptTemplateResponse.from(promptTemplateRepository.save(pt));
    }

    @Override
    public void delete(Long id) {
        PromptTemplate pt = promptTemplateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PromptTemplate not found: " + id));
        if (pt.isDefault()) {
            throw new IllegalStateException("Não é possível excluir o template padrão");
        }
        promptTemplateRepository.deleteById(id);
    }

    @Override
    @Transactional
    public PromptTemplateResponse setDefault(Long id) {
        PromptTemplate pt = promptTemplateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PromptTemplate not found: " + id));
        promptTemplateRepository.clearDefault();
        pt.setDefault(true);
        return PromptTemplateResponse.from(promptTemplateRepository.save(pt));
    }
}
