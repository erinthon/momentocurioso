package com.momentocurioso.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "scraped_articles", indexes = {
        @Index(name = "idx_articles_approval_status", columnList = "approval_status"),
        @Index(name = "idx_articles_source_used", columnList = "source_site_id, used")
})
@Getter
@Setter
public class ScrapedArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_site_id", nullable = false)
    private SourceSite sourceSite;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String sourceUrl;

    @Column(nullable = false)
    private LocalDateTime scrapedAt;

    @Column(nullable = false)
    private boolean used = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "queued_provider_id")
    private AiProvider queuedProvider;
}
