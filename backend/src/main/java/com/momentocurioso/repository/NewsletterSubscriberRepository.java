package com.momentocurioso.repository;

import com.momentocurioso.entity.NewsletterSubscriber;
import com.momentocurioso.entity.NewsletterSubscriberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {
    Optional<NewsletterSubscriber> findByEmailIgnoreCase(String email);
    Optional<NewsletterSubscriber> findByConfirmationTokenHash(String tokenHash);
    List<NewsletterSubscriber> findAllByStatusOrderByIdAsc(NewsletterSubscriberStatus status);
    Page<NewsletterSubscriber> findAllByStatus(NewsletterSubscriberStatus status, Pageable pageable);
    long countByStatus(NewsletterSubscriberStatus status);
}
