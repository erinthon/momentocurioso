package com.momentocurioso.repository;

import com.momentocurioso.entity.ScrapedArticle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScrapedArticleRepository extends JpaRepository<ScrapedArticle, Long> {

    List<ScrapedArticle> findBySourceSiteIdAndUsedFalse(Long sourceSiteId);

    boolean existsBySourceUrlAndSourceSiteId(String sourceUrl, Long sourceSiteId);
}
