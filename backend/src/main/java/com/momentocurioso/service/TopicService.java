package com.momentocurioso.service;

import com.momentocurioso.dto.request.CreateTopicRequest;
import com.momentocurioso.dto.request.UpdateTopicRequest;
import com.momentocurioso.dto.response.TopicResponse;

import java.util.List;

public interface TopicService {
    TopicResponse create(CreateTopicRequest request);
    List<TopicResponse> listActive();
    List<TopicResponse> listAll();
    TopicResponse update(Long id, UpdateTopicRequest request);
    void delete(Long id);
}
