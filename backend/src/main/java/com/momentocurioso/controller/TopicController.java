package com.momentocurioso.controller;

import com.momentocurioso.dto.request.CreateTopicRequest;
import com.momentocurioso.dto.request.UpdateTopicRequest;
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

    @GetMapping("/admin/topics")
    public ResponseEntity<List<TopicResponse>> listAll() {
        return ResponseEntity.ok(topicService.listAll());
    }

    @PutMapping("/admin/topics/{id}")
    public ResponseEntity<TopicResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody UpdateTopicRequest request) {
        return ResponseEntity.ok(topicService.update(id, request));
    }

    @DeleteMapping("/admin/topics/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        topicService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
