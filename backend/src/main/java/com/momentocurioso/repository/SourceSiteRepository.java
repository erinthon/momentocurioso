package com.momentocurioso.repository;

import com.momentocurioso.entity.SourceSite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SourceSiteRepository extends JpaRepository<SourceSite, Long> {
    List<SourceSite> findAllByTopicId(Long topicId);

    List<SourceSite> findByTopicIdAndActiveTrue(Long topicId);
}
