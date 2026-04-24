package com.momentocurioso.repository;

import com.momentocurioso.entity.ContentGenerationJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentGenerationJobRepository extends JpaRepository<ContentGenerationJob, Long> {
    List<ContentGenerationJob> findAllByOrderByStartedAtDesc();
}
