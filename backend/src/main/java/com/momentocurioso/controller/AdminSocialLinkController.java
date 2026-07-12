package com.momentocurioso.controller;

import com.momentocurioso.dto.request.SaveSocialLinkRequest;
import com.momentocurioso.dto.response.SocialLinkResponse;
import com.momentocurioso.service.SocialLinkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/social-links")
public class AdminSocialLinkController {

    private final SocialLinkService socialLinkService;

    public AdminSocialLinkController(SocialLinkService socialLinkService) {
        this.socialLinkService = socialLinkService;
    }

    @GetMapping
    public ResponseEntity<List<SocialLinkResponse>> listAll() {
        return ResponseEntity.ok(socialLinkService.findAll());
    }

    @PostMapping
    public ResponseEntity<SocialLinkResponse> create(@Valid @RequestBody SaveSocialLinkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(socialLinkService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SocialLinkResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody SaveSocialLinkRequest request) {
        return ResponseEntity.ok(socialLinkService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        socialLinkService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
