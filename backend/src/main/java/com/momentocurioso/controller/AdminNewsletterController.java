package com.momentocurioso.controller;

import com.momentocurioso.dto.request.SaveNewsletterIssueRequest;
import com.momentocurioso.dto.response.*;
import com.momentocurioso.entity.NewsletterSubscriberStatus;
import com.momentocurioso.service.NewsletterIssueService;
import com.momentocurioso.service.NewsletterSubscriptionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/newsletter")
public class AdminNewsletterController {

    private final NewsletterIssueService issueService;
    private final NewsletterSubscriptionService subscriptionService;

    public AdminNewsletterController(NewsletterIssueService issueService,
                                     NewsletterSubscriptionService subscriptionService) {
        this.issueService = issueService;
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/issues")
    public ResponseEntity<List<NewsletterIssueResponse>> listIssues() {
        return ResponseEntity.ok(issueService.list());
    }

    @PostMapping("/issues")
    public ResponseEntity<NewsletterIssueResponse> createIssue(
            @Valid @RequestBody SaveNewsletterIssueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(issueService.create(request));
    }

    @PutMapping("/issues/{id}")
    public ResponseEntity<NewsletterIssueResponse> updateIssue(
            @PathVariable Long id, @Valid @RequestBody SaveNewsletterIssueRequest request) {
        return ResponseEntity.ok(issueService.update(id, request));
    }

    @GetMapping(value = "/issues/{id}/preview", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> previewIssue(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.preview(id));
    }

    @PostMapping("/issues/{id}/send")
    public ResponseEntity<NewsletterSendResponse> sendIssue(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.send(id));
    }

    @DeleteMapping("/issues/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/subscribers")
    public ResponseEntity<PageResponse<NewsletterSubscriberResponse>> listSubscribers(
            @RequestParam(required = false) NewsletterSubscriberStatus status,
            @PageableDefault(size = 20, sort = "subscribedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(subscriptionService.list(status, pageable));
    }

    @GetMapping("/subscribers/count")
    public ResponseEntity<Map<String, Long>> countActiveSubscribers() {
        return ResponseEntity.ok(Map.of("active", subscriptionService.countActive()));
    }

    @DeleteMapping("/subscribers/{id}")
    public ResponseEntity<Void> deleteSubscriber(@PathVariable Long id) {
        subscriptionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
