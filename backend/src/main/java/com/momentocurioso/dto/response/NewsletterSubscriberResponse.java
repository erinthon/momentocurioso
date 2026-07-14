package com.momentocurioso.dto.response;

import com.momentocurioso.entity.NewsletterSubscriber;
import com.momentocurioso.entity.NewsletterSubscriberStatus;

import java.time.LocalDateTime;

public record NewsletterSubscriberResponse(
        Long id,
        String email,
        String name,
        NewsletterSubscriberStatus status,
        LocalDateTime subscribedAt,
        LocalDateTime confirmedAt,
        LocalDateTime unsubscribedAt
) {
    public static NewsletterSubscriberResponse from(NewsletterSubscriber subscriber) {
        return new NewsletterSubscriberResponse(
                subscriber.getId(),
                subscriber.getEmail(),
                subscriber.getName(),
                subscriber.getStatus(),
                subscriber.getSubscribedAt(),
                subscriber.getConfirmedAt(),
                subscriber.getUnsubscribedAt()
        );
    }
}
