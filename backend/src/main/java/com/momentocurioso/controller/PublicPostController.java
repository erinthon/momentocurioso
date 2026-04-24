package com.momentocurioso.controller;

import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.dto.response.PostSummaryResponse;
import com.momentocurioso.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PublicPostController {

    private final PostService postService;

    public PublicPostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostSummaryResponse>> list(
            @RequestParam(required = false) String topicSlug) {
        return ResponseEntity.ok(postService.listPublished(topicSlug));
    }

    @GetMapping("/posts/{slug}")
    public ResponseEntity<PostResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getPublishedBySlug(slug));
    }
}
