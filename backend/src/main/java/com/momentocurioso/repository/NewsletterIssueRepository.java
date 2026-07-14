package com.momentocurioso.repository;

import com.momentocurioso.entity.NewsletterIssue;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NewsletterIssueRepository extends JpaRepository<NewsletterIssue, Long> {
    @EntityGraph(attributePaths = "mainPost.topic")
    List<NewsletterIssue> findAllByOrderByCreatedAtDesc();

    @Override
    @EntityGraph(attributePaths = "mainPost.topic")
    Optional<NewsletterIssue> findById(Long id);
}
