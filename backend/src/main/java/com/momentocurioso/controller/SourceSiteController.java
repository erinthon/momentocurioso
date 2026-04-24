package com.momentocurioso.controller;

import com.momentocurioso.dto.request.CreateSourceSiteRequest;
import com.momentocurioso.dto.response.SourceSiteResponse;
import com.momentocurioso.service.SourceSiteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SourceSiteController {

    private final SourceSiteService sourceSiteService;

    public SourceSiteController(SourceSiteService sourceSiteService) {
        this.sourceSiteService = sourceSiteService;
    }

    @PostMapping("/admin/sources")
    public ResponseEntity<SourceSiteResponse> create(@Valid @RequestBody CreateSourceSiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sourceSiteService.create(request));
    }

    @GetMapping("/admin/topics/{topicId}/sources")
    public ResponseEntity<List<SourceSiteResponse>> listByTopic(@PathVariable Long topicId) {
        return ResponseEntity.ok(sourceSiteService.listByTopic(topicId));
    }

    @DeleteMapping("/admin/sources/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sourceSiteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
