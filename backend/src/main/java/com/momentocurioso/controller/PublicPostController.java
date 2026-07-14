package com.momentocurioso.controller;

import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.dto.response.PublicPostSummaryResponse;
import com.momentocurioso.service.PostThumbnailService;
import com.momentocurioso.service.PostService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Optional;

@RestController
public class PublicPostController {

    private final PostService postService;
    private final PostThumbnailService thumbnailService;

    public PublicPostController(PostService postService, PostThumbnailService thumbnailService) {
        this.postService = postService;
        this.thumbnailService = thumbnailService;
    }

    @GetMapping("/posts")
    public ResponseEntity<PageResponse<PublicPostSummaryResponse>> list(
            @RequestParam(required = false) String topicSlug,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(postService.listPublished(topicSlug, pageable));
    }

    @GetMapping("/posts/{slug}")
    public ResponseEntity<PostResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getPublishedBySlug(slug));
    }

    @GetMapping("/posts/{slug}/thumbnail")
    public ResponseEntity<byte[]> getThumbnail(@PathVariable String slug) {
        PostResponse post = postService.getPublishedBySlug(slug);
        return imageResponse(thumbnailService.decode(post.thumbnail()));
    }

    @GetMapping("/posts/{slug}/social-thumbnail")
    public ResponseEntity<byte[]> getSocialThumbnail(@PathVariable String slug) {
        PostResponse post = postService.getPublishedBySlug(slug);
        return imageResponse(thumbnailService.createSocial(slug, post.thumbnail()));
    }

    private ResponseEntity<byte[]> imageResponse(Optional<PostThumbnailService.PostThumbnail> thumbnail) {
        return thumbnail.map(image -> ResponseEntity.ok()
                .contentType(image.mediaType())
                .contentLength(image.content().length)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(7)).cachePublic())
                .body(image.content()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
