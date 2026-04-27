package com.momentocurioso.controller;

import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.dto.response.PostSummaryResponse;
import com.momentocurioso.service.PostService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class PublicPostController {

    private final PostService postService;

    public PublicPostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/posts")
    public ResponseEntity<PageResponse<PostSummaryResponse>> list(
            @RequestParam(required = false) String topicSlug,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(postService.listPublished(topicSlug, pageable));
    }

    @GetMapping("/posts/{slug}")
    public ResponseEntity<PostResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getPublishedBySlug(slug));
    }
}
