package com.momentocurioso.controller;

import com.momentocurioso.dto.request.CreateAiProviderRequest;
import com.momentocurioso.dto.response.AiProviderResponse;
import com.momentocurioso.service.AiProviderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/ai-providers")
public class AdminAiProviderController {

    private final AiProviderService aiProviderService;

    public AdminAiProviderController(AiProviderService aiProviderService) {
        this.aiProviderService = aiProviderService;
    }

    @GetMapping
    public ResponseEntity<List<AiProviderResponse>> listAll() {
        return ResponseEntity.ok(aiProviderService.findAll());
    }

    @PostMapping
    public ResponseEntity<AiProviderResponse> create(@Valid @RequestBody CreateAiProviderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aiProviderService.create(request));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<AiProviderResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(aiProviderService.activate(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        aiProviderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
