package com.momentocurioso.service.impl;

import com.momentocurioso.dto.request.CreateTopicRequest;
import com.momentocurioso.dto.request.UpdateTopicRequest;
import com.momentocurioso.dto.response.TopicResponse;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.repository.TopicRepository;
import com.momentocurioso.service.TopicService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;

    public TopicServiceImpl(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    @Override
    @CacheEvict(value = "topics", allEntries = true)
    public TopicResponse create(CreateTopicRequest request) {
        if (topicRepository.existsBySlug(request.slug())) {
            throw new IllegalArgumentException("Slug already in use: " + request.slug());
        }
        Topic topic = new Topic();
        topic.setName(request.name());
        topic.setSlug(request.slug());
        topic.setDescription(request.description());
        topic.setAutoPublish(request.autoPublish());
        topic.setRequireApproval(request.requireApproval());
        return TopicResponse.from(topicRepository.save(topic));
    }

    @Override
    public TopicResponse findById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found: " + id));
        return TopicResponse.from(topic);
    }

    @Override
    @Cacheable("topics")
    public List<TopicResponse> listActive() {
        return topicRepository.findAllByActiveTrue()
                .stream()
                .map(TopicResponse::from)
                .toList();
    }

    @Override
    public List<TopicResponse> listAll() {
        return topicRepository.findAll(Sort.by("name"))
                .stream()
                .map(TopicResponse::from)
                .toList();
    }

    @Override
    @CacheEvict(value = "topics", allEntries = true)
    public TopicResponse update(Long id, UpdateTopicRequest request) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found: " + id));
        topic.setName(request.name());
        topic.setDescription(request.description());
        topic.setAutoPublish(request.autoPublish());
        topic.setRequireApproval(request.requireApproval());
        return TopicResponse.from(topicRepository.save(topic));
    }

    @Override
    @CacheEvict(value = "topics", allEntries = true)
    public void delete(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found: " + id));
        topic.setActive(false);
        topicRepository.save(topic);
    }
}
