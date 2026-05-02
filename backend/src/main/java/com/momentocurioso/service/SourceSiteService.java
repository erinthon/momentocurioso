package com.momentocurioso.service;

import com.momentocurioso.dto.request.CreateSourceSiteRequest;
import com.momentocurioso.dto.request.UpdateSourceSiteRequest;
import com.momentocurioso.dto.response.SourceSiteResponse;

import java.util.List;

public interface SourceSiteService {
    SourceSiteResponse create(CreateSourceSiteRequest request);
    List<SourceSiteResponse> listByTopic(Long topicId);
    void delete(Long id);
    SourceSiteResponse update(Long id, UpdateSourceSiteRequest request);
}
