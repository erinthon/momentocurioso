package com.momentocurioso.repository;

import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentGenerationJobRepository extends JpaRepository<ContentGenerationJob, Long> {
    Page<ContentGenerationJob> findAllByOrderByStartedAtDesc(Pageable pageable);
    Page<ContentGenerationJob> findAllByStatusOrderByStartedAtDesc(JobStatus status, Pageable pageable);
}
