package com.momentocurioso.repository;

import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByStatusOrderByCreatedAtDesc(PostStatus status);

    @EntityGraph(attributePaths = "topic")
    Page<Post> findByTopicSlugAndStatus(String topicSlug, PostStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "topic")
    Page<Post> findAllByStatus(PostStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "topic")
    Optional<Post> findBySlug(String slug);

    @Override
    @EntityGraph(attributePaths = "topic")
    Page<Post> findAll(Pageable pageable);

    boolean existsBySlug(String slug);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByStatus(PostStatus status);
}
