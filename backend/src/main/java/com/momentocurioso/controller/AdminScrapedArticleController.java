package com.momentocurioso.controller;

import com.momentocurioso.dto.request.QueueArticleRequest;
import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.ScrapedArticleResponse;
import com.momentocurioso.entity.ApprovalStatus;
import com.momentocurioso.service.ScrapedArticleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/scraped-articles")
public class AdminScrapedArticleController {

    private final ScrapedArticleService service;

    public AdminScrapedArticleController(ScrapedArticleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ScrapedArticleResponse>> listAll(
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long sourceSiteId,
            @RequestParam(required = false) ApprovalStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.listAll(topicId, sourceSiteId, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScrapedArticleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ScrapedArticleResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(service.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ScrapedArticleResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(service.reject(id));
    }

    @PatchMapping("/{id}/queue")
    public ResponseEntity<ScrapedArticleResponse> queue(
            @PathVariable Long id,
            @RequestBody @Valid QueueArticleRequest req) {
        return ResponseEntity.ok(service.queueForAi(id, req.aiProviderId()));
    }
}
