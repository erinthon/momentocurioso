package com.momentocurioso.repository;

import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContentGenerationJobRepository extends JpaRepository<ContentGenerationJob, Long> {

    @EntityGraph(attributePaths = "topic")
    Page<ContentGenerationJob> findAllByOrderByStartedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = "topic")
    Page<ContentGenerationJob> findAllByStatusOrderByStartedAtDesc(JobStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "topic")
    Optional<ContentGenerationJob> findFirstByOrderByStartedAtDesc();
}
