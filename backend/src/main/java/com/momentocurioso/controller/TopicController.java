package com.momentocurioso.controller;

import com.momentocurioso.dto.request.CreateTopicRequest;
import com.momentocurioso.dto.response.TopicResponse;
import com.momentocurioso.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @PostMapping("/admin/topics")
    public ResponseEntity<TopicResponse> create(@Valid @RequestBody CreateTopicRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(topicService.create(request));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TopicResponse>> listActive() {
        return ResponseEntity.ok(topicService.listActive());
    }
}
