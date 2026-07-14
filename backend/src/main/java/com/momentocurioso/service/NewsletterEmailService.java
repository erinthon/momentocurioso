package com.momentocurioso.service;

import com.momentocurioso.entity.NewsletterIssue;
import com.momentocurioso.entity.NewsletterSubscriber;

public interface NewsletterEmailService {
    boolean isEnabled();
    void sendConfirmation(NewsletterSubscriber subscriber, String rawToken);
    void sendIssue(NewsletterIssue issue, NewsletterSubscriber subscriber);
}
