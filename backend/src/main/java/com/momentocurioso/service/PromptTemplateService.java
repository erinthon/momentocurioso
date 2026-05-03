package com.momentocurioso.service;

import com.momentocurioso.dto.request.CreatePromptTemplateRequest;
import com.momentocurioso.dto.request.UpdatePromptTemplateRequest;
import com.momentocurioso.dto.response.PromptTemplateResponse;

import java.util.List;

public interface PromptTemplateService {

    List<PromptTemplateResponse> findAll();

    PromptTemplateResponse create(CreatePromptTemplateRequest request);

    PromptTemplateResponse update(Long id, UpdatePromptTemplateRequest request);

    void delete(Long id);

    PromptTemplateResponse setDefault(Long id);
}
