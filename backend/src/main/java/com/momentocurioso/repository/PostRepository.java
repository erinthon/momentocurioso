package com.momentocurioso.repository;

import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByTopicSlugAndStatusOrderByCreatedAtDesc(String topicSlug, PostStatus status);
    List<Post> findAllByStatusOrderByCreatedAtDesc(PostStatus status);
    Page<Post> findByTopicSlugAndStatus(String topicSlug, PostStatus status, Pageable pageable);
    Page<Post> findAllByStatus(PostStatus status, Pageable pageable);
    Optional<Post> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
