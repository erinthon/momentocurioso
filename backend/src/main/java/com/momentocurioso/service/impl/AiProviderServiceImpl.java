package com.momentocurioso.service.impl;

import com.momentocurioso.dto.request.CreateAiProviderRequest;
import com.momentocurioso.dto.response.AiProviderResponse;
import com.momentocurioso.entity.AiProvider;
import com.momentocurioso.repository.AiProviderRepository;
import com.momentocurioso.service.AiProviderService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AiProviderServiceImpl implements AiProviderService {

    private final AiProviderRepository aiProviderRepository;

    public AiProviderServiceImpl(AiProviderRepository aiProviderRepository) {
        this.aiProviderRepository = aiProviderRepository;
    }

    @Override
    public List<AiProviderResponse> findAll() {
        return aiProviderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AiProviderResponse::from)
                .toList();
    }

    @Override
    public AiProviderResponse create(CreateAiProviderRequest request) {
        AiProvider provider = new AiProvider();
        provider.setName(request.name());
        provider.setType(request.type());
        provider.setApiKey(request.apiKey());
        provider.setBaseUrl(request.baseUrl());
        provider.setModel(request.model());
        return AiProviderResponse.from(aiProviderRepository.save(provider));
    }

    @Override
    @Transactional
    public AiProviderResponse activate(Long id) {
        AiProvider provider = aiProviderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("AiProvider not found: " + id));
        aiProviderRepository.deactivateAll();
        provider.setActive(true);
        return AiProviderResponse.from(aiProviderRepository.save(provider));
    }

    @Override
    public void delete(Long id) {
        if (!aiProviderRepository.existsById(id)) {
            throw new EntityNotFoundException("AiProvider not found: " + id);
        }
        aiProviderRepository.deleteById(id);
    }
}
