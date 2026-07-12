package com.momentocurioso.controller;

import com.momentocurioso.dto.response.SocialLinkResponse;
import com.momentocurioso.service.SocialLinkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/social-links")
public class PublicSocialLinkController {

    private final SocialLinkService socialLinkService;

    public PublicSocialLinkController(SocialLinkService socialLinkService) {
        this.socialLinkService = socialLinkService;
    }

    @GetMapping
    public ResponseEntity<List<SocialLinkResponse>> listActive() {
        return ResponseEntity.ok(socialLinkService.findActive());
    }
}
