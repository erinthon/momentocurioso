package com.momentocurioso.service;

import com.momentocurioso.dto.request.SaveNewsletterIssueRequest;
import com.momentocurioso.dto.response.NewsletterIssueResponse;
import com.momentocurioso.dto.response.NewsletterSendResponse;

import java.util.List;

public interface NewsletterIssueService {
    List<NewsletterIssueResponse> list();
    NewsletterIssueResponse create(SaveNewsletterIssueRequest request);
    NewsletterIssueResponse update(Long id, SaveNewsletterIssueRequest request);
    NewsletterSendResponse send(Long id);
    void delete(Long id);
}
