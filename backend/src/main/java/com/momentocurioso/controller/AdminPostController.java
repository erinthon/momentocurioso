package com.momentocurioso.controller;

import com.momentocurioso.dto.request.TriggerJobRequest;
import com.momentocurioso.dto.response.JobStatusResponse;
import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.dto.response.PostSummaryResponse;
import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.JobStatus;
import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.entity.TriggerSource;
import com.momentocurioso.repository.TopicRepository;
import com.momentocurioso.scheduler.ContentGenerationScheduler;
import com.momentocurioso.service.ContentGenerationJobService;
import com.momentocurioso.service.PostService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminPostController {

    private final PostService postService;
    private final ContentGenerationJobService jobService;
    private final ContentGenerationScheduler scheduler;
    private final TopicRepository topicRepository;

    public AdminPostController(PostService postService,
                               ContentGenerationJobService jobService,
                               ContentGenerationScheduler scheduler,
                               TopicRepository topicRepository) {
        this.postService = postService;
        this.jobService = jobService;
        this.scheduler = scheduler;
        this.topicRepository = topicRepository;
    }

    @GetMapping("/posts")
    public ResponseEntity<PageResponse<PostSummaryResponse>> listAll(
            @RequestParam(required = false) PostStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(postService.listAllAdmin(status, pageable));
    }

    @PatchMapping("/posts/{id}/approve")
    public ResponseEntity<PostResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(postService.approve(id));
    }

    @PatchMapping("/posts/{id}/reject")
    public ResponseEntity<PostResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(postService.reject(id));
    }

    @PostMapping("/content/trigger")
    public ResponseEntity<JobStatusResponse> trigger(@Valid @RequestBody TriggerJobRequest request) {
        Topic topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> new EntityNotFoundException("Topic not found: " + request.topicId()));

        ContentGenerationJob job = scheduler.runForTopic(topic, TriggerSource.MANUAL);

        return ResponseEntity.ok(JobStatusResponse.from(job));
    }

    @GetMapping("/jobs")
    public ResponseEntity<PageResponse<JobStatusResponse>> listJobs(
            @RequestParam(required = false) JobStatus status,
            @PageableDefault(size = 20, sort = "startedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(jobService.listAllAdmin(status, pageable));
    }
}
