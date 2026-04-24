package com.momentocurioso.service.impl;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.repository.PostRepository;
import com.momentocurioso.service.PostService;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDateTime;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;

    public PostServiceImpl(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Override
    public Post saveDraft(Topic topic, AiGeneratedContent content) {
        Post post = new Post();
        post.setTopic(topic);
        post.setTitle(content.title());
        post.setSlug(generateUniqueSlug(content.title()));
        post.setSummary(content.summary());
        post.setContent(content.content());

        if (topic.isAutoPublish()) {
            post.setStatus(PostStatus.PUBLISHED);
            post.setPublishedAt(LocalDateTime.now());
        } else {
            post.setStatus(PostStatus.DRAFT);
        }

        return postRepository.save(post);
    }

    private String generateUniqueSlug(String title) {
        String base = Normalizer.normalize(title, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        if (base.length() > 80) {
            base = base.substring(0, 80).replaceAll("-$", "");
        }

        String slug = base;
        int suffix = 1;
        while (postRepository.existsBySlug(slug)) {
            slug = base + "-" + suffix++;
        }
        return slug;
    }
}
