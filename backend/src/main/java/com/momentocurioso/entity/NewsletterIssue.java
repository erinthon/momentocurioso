package com.momentocurioso.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_issues")
@Getter
@Setter
public class NewsletterIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String preheader;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_post_id", nullable = false)
    private Post mainPost;

    @Column(nullable = false, length = 500)
    private String quickFactOne;

    @Column(nullable = false, length = 500)
    private String quickFactTwo;

    @Column(nullable = false, length = 500)
    private String quickFactThree;

    private String videoTitle;

    @Column(length = 2048)
    private String videoUrl;

    private String recommendationTitle;

    @Column(length = 2048)
    private String recommendationUrl;

    @Column(nullable = false, length = 500)
    private String communityQuestion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NewsletterIssueStatus status = NewsletterIssueStatus.DRAFT;

    @Column(nullable = false)
    private int sentCount;

    @Column(nullable = false)
    private int failedCount;

    private LocalDateTime sentAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
