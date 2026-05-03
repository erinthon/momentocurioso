package com.momentocurioso.controller;

import com.momentocurioso.dto.request.CreatePromptTemplateRequest;
import com.momentocurioso.dto.request.UpdatePromptTemplateRequest;
import com.momentocurioso.dto.response.PromptTemplateResponse;
import com.momentocurioso.service.PromptTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/prompt-templates")
public class AdminPromptTemplateController {

    private final PromptTemplateService promptTemplateService;

    public AdminPromptTemplateController(PromptTemplateService promptTemplateService) {
        this.promptTemplateService = promptTemplateService;
    }

    @GetMapping
    public ResponseEntity<List<PromptTemplateResponse>> listAll() {
        return ResponseEntity.ok(promptTemplateService.findAll());
    }

    @PostMapping
    public ResponseEntity<PromptTemplateResponse> create(@Valid @RequestBody CreatePromptTemplateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promptTemplateService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromptTemplateResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePromptTemplateRequest request) {
        return ResponseEntity.ok(promptTemplateService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        promptTemplateService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<PromptTemplateResponse> setDefault(@PathVariable Long id) {
        return ResponseEntity.ok(promptTemplateService.setDefault(id));
    }
}
