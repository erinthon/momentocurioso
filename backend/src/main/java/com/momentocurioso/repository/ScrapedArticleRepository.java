package com.momentocurioso.repository;

import com.momentocurioso.entity.ApprovalStatus;
import com.momentocurioso.entity.ScrapedArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScrapedArticleRepository extends JpaRepository<ScrapedArticle, Long> {

    List<ScrapedArticle> findBySourceSiteIdAndUsedFalse(Long sourceSiteId);

    boolean existsBySourceUrlAndSourceSiteId(String sourceUrl, Long sourceSiteId);

    @EntityGraph(attributePaths = {"sourceSite", "sourceSite.topic", "queuedProvider"})
    Page<ScrapedArticle> findBySourceSite_TopicId(Long topicId, Pageable pageable);

    @EntityGraph(attributePaths = {"sourceSite", "sourceSite.topic", "queuedProvider"})
    Page<ScrapedArticle> findBySourceSite_TopicIdAndApprovalStatus(Long topicId, ApprovalStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"sourceSite", "sourceSite.topic", "queuedProvider"})
    Page<ScrapedArticle> findAllByApprovalStatus(ApprovalStatus status, Pageable pageable);

    List<ScrapedArticle> findBySourceSiteIdAndUsedFalseAndApprovalStatus(Long sourceSiteId, ApprovalStatus status);

    @EntityGraph(attributePaths = {"sourceSite", "sourceSite.topic", "queuedProvider"})
    Page<ScrapedArticle> findBySourceSite_Id(Long sourceSiteId, Pageable pageable);

    @EntityGraph(attributePaths = {"sourceSite", "sourceSite.topic", "queuedProvider"})
    Page<ScrapedArticle> findBySourceSite_IdAndApprovalStatus(Long sourceSiteId, ApprovalStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"sourceSite", "sourceSite.topic", "queuedProvider"})
    Page<ScrapedArticle> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"sourceSite", "sourceSite.topic", "queuedProvider"})
    List<ScrapedArticle> findAllByIdIn(List<Long> ids);

    long countByApprovalStatus(ApprovalStatus status);
}
