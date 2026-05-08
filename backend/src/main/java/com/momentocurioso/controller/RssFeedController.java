package com.momentocurioso.controller;

import com.momentocurioso.service.RssFeedService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feed.xml")
public class RssFeedController {

    private final RssFeedService rssFeedService;

    public RssFeedController(RssFeedService rssFeedService) {
        this.rssFeedService = rssFeedService;
    }

    @GetMapping(produces = "application/rss+xml;charset=UTF-8")
    public ResponseEntity<String> feed(@RequestParam(required = false) String topicSlug) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/rss+xml;charset=UTF-8"))
                .body(rssFeedService.buildRssFeed(topicSlug));
    }
}
