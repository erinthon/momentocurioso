package com.momentocurioso.service.impl;

import com.momentocurioso.dto.response.NotificationCountsResponse;
import com.momentocurioso.entity.ApprovalStatus;
import com.momentocurioso.repository.ScrapedArticleRepository;
import com.momentocurioso.service.NotificationService;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final ScrapedArticleRepository scrapedArticleRepository;

    public NotificationServiceImpl(ScrapedArticleRepository scrapedArticleRepository) {
        this.scrapedArticleRepository = scrapedArticleRepository;
    }

    // Sem cache: o badge da navbar faz polling e precisa de contagens sempre atuais.
    @Override
    public NotificationCountsResponse getCounts() {
        long pendingApproval = scrapedArticleRepository.countByApprovalStatus(ApprovalStatus.PENDING);
        long queued = scrapedArticleRepository.countByApprovalStatus(ApprovalStatus.QUEUED);
        return new NotificationCountsResponse(pendingApproval, queued);
    }
}
