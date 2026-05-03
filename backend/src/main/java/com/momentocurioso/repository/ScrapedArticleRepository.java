package com.momentocurioso.repository;

import com.momentocurioso.entity.ApprovalStatus;
import com.momentocurioso.entity.ScrapedArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScrapedArticleRepository extends JpaRepository<ScrapedArticle, Long> {

    List<ScrapedArticle> findBySourceSiteIdAndUsedFalse(Long sourceSiteId);

    boolean existsBySourceUrlAndSourceSiteId(String sourceUrl, Long sourceSiteId);

    Page<ScrapedArticle> findBySourceSite_TopicId(Long topicId, Pageable pageable);

    Page<ScrapedArticle> findBySourceSite_TopicIdAndApprovalStatus(Long topicId, ApprovalStatus status, Pageable pageable);

    Page<ScrapedArticle> findAllByApprovalStatus(ApprovalStatus status, Pageable pageable);

    List<ScrapedArticle> findBySourceSiteIdAndUsedFalseAndApprovalStatus(Long sourceSiteId, ApprovalStatus status);
}
