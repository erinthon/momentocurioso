package com.momentocurioso.service;

import com.momentocurioso.dto.request.CreateAiProviderRequest;
import com.momentocurioso.dto.response.AiProviderResponse;

import java.util.List;

public interface AiProviderService {

    List<AiProviderResponse> findAll();

    AiProviderResponse create(CreateAiProviderRequest request);

    AiProviderResponse activate(Long id);

    void delete(Long id);
}
