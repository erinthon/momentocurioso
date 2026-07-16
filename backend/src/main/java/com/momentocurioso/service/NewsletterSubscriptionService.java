package com.momentocurioso.service;

import com.momentocurioso.dto.request.SubscribeNewsletterRequest;
import com.momentocurioso.dto.response.NewsletterMessageResponse;
import com.momentocurioso.dto.response.NewsletterSubscriberResponse;
import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.entity.NewsletterSubscriberStatus;
import org.springframework.data.domain.Pageable;

public interface NewsletterSubscriptionService {
    NewsletterMessageResponse subscribe(SubscribeNewsletterRequest request);
    NewsletterMessageResponse confirm(String token);
    NewsletterMessageResponse unsubscribe(String token);
    PageResponse<NewsletterSubscriberResponse> list(NewsletterSubscriberStatus status, Pageable pageable);
    long countActive();
    void delete(Long id);
}
