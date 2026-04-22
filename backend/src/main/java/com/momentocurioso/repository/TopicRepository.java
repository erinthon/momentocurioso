package com.momentocurioso.repository;

import com.momentocurioso.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    Optional<Topic> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Topic> findAllByActiveTrue();
}
