package com.momentocurioso.controller;

import com.momentocurioso.dto.request.GenerateFromQueueRequest;
import com.momentocurioso.dto.response.JobStatusResponse;
import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.ScrapedArticleResponse;
import com.momentocurioso.service.AiWriterQueueService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/ai-writer")
public class AdminAiWriterController {

    private final AiWriterQueueService service;

    public AdminAiWriterController(AiWriterQueueService service) {
        this.service = service;
    }

    @GetMapping("/queue")
    public ResponseEntity<PageResponse<ScrapedArticleResponse>> listQueue(
            @PageableDefault(size = 100) Pageable pageable) {
        return ResponseEntity.ok(service.listQueue(pageable));
    }

    @PostMapping("/generate")
    public ResponseEntity<JobStatusResponse> generate(@RequestBody @Valid GenerateFromQueueRequest req) {
        return ResponseEntity.ok(service.generateFromQueue(req));
    }
}
