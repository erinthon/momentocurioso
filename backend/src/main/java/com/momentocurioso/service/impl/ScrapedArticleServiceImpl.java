package com.momentocurioso.service.impl;

import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.ScrapedArticleResponse;
import com.momentocurioso.entity.ApprovalStatus;
import com.momentocurioso.entity.ScrapedArticle;
import com.momentocurioso.repository.ScrapedArticleRepository;
import com.momentocurioso.service.ScrapedArticleService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScrapedArticleServiceImpl implements ScrapedArticleService {

    private final ScrapedArticleRepository repository;

    public ScrapedArticleServiceImpl(ScrapedArticleRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ScrapedArticleResponse> listAll(Long topicId, ApprovalStatus status, Pageable pageable) {
        Page<ScrapedArticle> page;
        if (topicId != null && status != null) {
            page = repository.findBySourceSite_TopicIdAndApprovalStatus(topicId, status, pageable);
        } else if (topicId != null) {
            page = repository.findBySourceSite_TopicId(topicId, pageable);
        } else if (status != null) {
            page = repository.findAllByApprovalStatus(status, pageable);
        } else {
            page = repository.findAll(pageable);
        }
        return PageResponse.from(page.map(ScrapedArticleResponse::from));
    }

    @Override
    @Transactional(readOnly = true)
    public ScrapedArticleResponse getById(Long id) {
        return ScrapedArticleResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    public ScrapedArticleResponse approve(Long id) {
        ScrapedArticle article = findOrThrow(id);
        if (article.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Apenas artigos PENDING podem ser aprovados");
        }
        article.setApprovalStatus(ApprovalStatus.APPROVED);
        return ScrapedArticleResponse.from(repository.save(article));
    }

    @Override
    @Transactional
    public ScrapedArticleResponse reject(Long id) {
        ScrapedArticle article = findOrThrow(id);
        if (article.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Apenas artigos PENDING podem ser rejeitados");
        }
        article.setApprovalStatus(ApprovalStatus.REJECTED);
        return ScrapedArticleResponse.from(repository.save(article));
    }

    private ScrapedArticle findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ScrapedArticle not found: " + id));
    }
}
