package com.momentocurioso.controller;

import com.momentocurioso.dto.request.NewsletterTokenRequest;
import com.momentocurioso.dto.request.SubscribeNewsletterRequest;
import com.momentocurioso.dto.response.NewsletterMessageResponse;
import com.momentocurioso.service.NewsletterSubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/newsletter")
public class NewsletterController {

    private final NewsletterSubscriptionService subscriptionService;

    public NewsletterController(NewsletterSubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/subscriptions")
    public ResponseEntity<NewsletterMessageResponse> subscribe(
            @Valid @RequestBody SubscribeNewsletterRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(subscriptionService.subscribe(request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<NewsletterMessageResponse> confirm(@Valid @RequestBody NewsletterTokenRequest request) {
        return ResponseEntity.ok(subscriptionService.confirm(request.token()));
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<NewsletterMessageResponse> unsubscribe(@Valid @RequestBody NewsletterTokenRequest request) {
        return ResponseEntity.ok(subscriptionService.unsubscribe(request.token()));
    }
}
