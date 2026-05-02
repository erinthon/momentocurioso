package com.momentocurioso.service.impl;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.dto.request.UpdatePostRequest;
import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.dto.response.PostSummaryResponse;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.repository.PostRepository;
import com.momentocurioso.service.PostService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;

    public PostServiceImpl(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Override
    @CacheEvict(value = "posts", allEntries = true)
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

        try {
            return postRepository.save(post);
        } catch (DataIntegrityViolationException e) {
            post.setSlug(post.getSlug() + "-" + UUID.randomUUID().toString().substring(0, 8));
            return postRepository.save(post);
        }
    }

    @Override
    @Cacheable(value = "posts", key = "'list:' + #topicSlug + ':p' + #pageable.pageNumber")
    public PageResponse<PostSummaryResponse> listPublished(String topicSlug, Pageable pageable) {
        PageRequest pageRequest = PageRequest.of(
                pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        var posts = topicSlug != null && !topicSlug.isBlank()
                ? postRepository.findByTopicSlugAndStatus(topicSlug, PostStatus.PUBLISHED, pageRequest)
                : postRepository.findAllByStatus(PostStatus.PUBLISHED, pageRequest);
        return PageResponse.from(posts.map(PostSummaryResponse::from));
    }

    @Override
    @Cacheable(value = "posts", key = "'slug:' + #slug")
    public PostResponse getPublishedBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .filter(p -> p.getStatus() == PostStatus.PUBLISHED)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + slug));
        return PostResponse.from(post);
    }

    @Override
    public PageResponse<PostSummaryResponse> listAllAdmin(PostStatus status, Pageable pageable) {
        PageRequest pageRequest = PageRequest.of(
                pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        var page = status != null
                ? postRepository.findAllByStatus(status, pageRequest)
                : postRepository.findAll(pageRequest);
        return PageResponse.from(page.map(PostSummaryResponse::from));
    }

    @Override
    public PostResponse findAdminById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + id));
        return PostResponse.from(post);
    }

    @Override
    @CacheEvict(value = "posts", allEntries = true)
    public PostResponse approve(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + id));
        if (post.getStatus() == PostStatus.PUBLISHED) {
            throw new IllegalStateException("Post is already published, current status: " + post.getStatus());
        }
        post.setStatus(PostStatus.PUBLISHED);
        post.setPublishedAt(LocalDateTime.now());
        return PostResponse.from(postRepository.save(post));
    }

    @Override
    @CacheEvict(value = "posts", allEntries = true)
    public PostResponse reject(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + id));
        if (post.getStatus() != PostStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT posts can be rejected, current status: " + post.getStatus());
        }
        post.setStatus(PostStatus.REJECTED);
        return PostResponse.from(postRepository.save(post));
    }

    @Override
    @CacheEvict(value = "posts", allEntries = true)
    public PostResponse unpublish(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + id));
        if (post.getStatus() != PostStatus.PUBLISHED) {
            throw new IllegalStateException("Only PUBLISHED posts can be unpublished, current status: " + post.getStatus());
        }
        post.setStatus(PostStatus.DRAFT);
        post.setPublishedAt(null);
        return PostResponse.from(postRepository.save(post));
    }

    @Override
    @CacheEvict(value = "posts", allEntries = true)
    public PostResponse update(Long id, UpdatePostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + id));
        post.setTitle(request.title());
        post.setSummary(request.summary());
        post.setContent(request.content());
        return PostResponse.from(postRepository.save(post));
    }

    @Override
    @CacheEvict(value = "posts", allEntries = true)
    public void delete(Long id) {
        if (!postRepository.existsById(id)) {
            throw new EntityNotFoundException("Post not found: " + id);
        }
        postRepository.deleteById(id);
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
