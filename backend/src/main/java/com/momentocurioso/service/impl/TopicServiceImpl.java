package com.momentocurioso.service.impl;

import com.momentocurioso.dto.request.CreateTopicRequest;
import com.momentocurioso.dto.response.TopicResponse;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.repository.TopicRepository;
import com.momentocurioso.service.TopicService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;

    public TopicServiceImpl(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    @Override
    public TopicResponse create(CreateTopicRequest request) {
        if (topicRepository.existsBySlug(request.slug())) {
            throw new IllegalArgumentException("Slug already in use: " + request.slug());
        }
        Topic topic = new Topic();
        topic.setName(request.name());
        topic.setSlug(request.slug());
        topic.setDescription(request.description());
        topic.setAutoPublish(request.autoPublish());
        return TopicResponse.from(topicRepository.save(topic));
    }

    @Override
    public List<TopicResponse> listActive() {
        return topicRepository.findAllByActiveTrue()
                .stream()
                .map(TopicResponse::from)
                .toList();
    }
}
