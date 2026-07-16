CREATE TABLE newsletter_subscribers (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(320) NOT NULL,
    name VARCHAR(100) NULL,
    status VARCHAR(20) NOT NULL,
    confirmation_token_hash VARCHAR(64) NULL,
    subscribed_at DATETIME(6) NOT NULL,
    confirmed_at DATETIME(6) NULL,
    unsubscribed_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_newsletter_subscriber_email UNIQUE (email),
    CONSTRAINT uk_newsletter_confirmation_token UNIQUE (confirmation_token_hash),
    INDEX idx_newsletter_subscriber_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE newsletter_issues (
    id BIGINT NOT NULL AUTO_INCREMENT,
    subject VARCHAR(255) NOT NULL,
    preheader VARCHAR(255) NOT NULL,
    main_post_id BIGINT NOT NULL,
    quick_fact_one VARCHAR(500) NOT NULL,
    quick_fact_two VARCHAR(500) NOT NULL,
    quick_fact_three VARCHAR(500) NOT NULL,
    video_title VARCHAR(255) NULL,
    video_url VARCHAR(255) NULL,
    recommendation_title VARCHAR(255) NULL,
    recommendation_url VARCHAR(255) NULL,
    community_question VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL,
    sent_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    sent_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_newsletter_issue_main_post FOREIGN KEY (main_post_id) REFERENCES posts (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
