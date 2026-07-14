package com.momentocurioso.controller;

import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.service.PostPageRenderer;
import com.momentocurioso.service.PostService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.nio.charset.StandardCharsets;

@Controller
public class PostPageController {

    private static final MediaType TEXT_HTML_UTF8 = new MediaType("text", "html", StandardCharsets.UTF_8);

    private final PostService postService;
    private final PostPageRenderer postPageRenderer;

    public PostPageController(PostService postService, PostPageRenderer postPageRenderer) {
        this.postService = postService;
        this.postPageRenderer = postPageRenderer;
    }

    @GetMapping(value = "/post-pages/{slug}", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public ResponseEntity<String> page(@PathVariable String slug) {
        PostResponse post = postService.getPublishedBySlug(slug);
        return ResponseEntity.ok()
                .contentType(TEXT_HTML_UTF8)
                .cacheControl(CacheControl.noCache())
                .body(postPageRenderer.render(post));
    }
}
