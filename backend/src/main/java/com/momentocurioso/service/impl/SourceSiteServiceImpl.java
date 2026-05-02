package com.momentocurioso.service.impl;

import com.momentocurioso.dto.request.CreateSourceSiteRequest;
import com.momentocurioso.dto.request.UpdateSourceSiteRequest;
import com.momentocurioso.dto.response.SourceSiteResponse;
import com.momentocurioso.entity.SourceSite;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.repository.SourceSiteRepository;
import com.momentocurioso.repository.TopicRepository;
import com.momentocurioso.service.SourceSiteService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SourceSiteServiceImpl implements SourceSiteService {

    private final SourceSiteRepository sourceSiteRepository;
    private final TopicRepository topicRepository;

    public SourceSiteServiceImpl(SourceSiteRepository sourceSiteRepository, TopicRepository topicRepository) {
        this.sourceSiteRepository = sourceSiteRepository;
        this.topicRepository = topicRepository;
    }

    @Override
    public SourceSiteResponse create(CreateSourceSiteRequest request) {
        Topic topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> new EntityNotFoundException("Topic not found: " + request.topicId()));
        SourceSite sourceSite = new SourceSite();
        sourceSite.setTopic(topic);
        sourceSite.setUrl(request.url());
        sourceSite.setType(request.type());
        return SourceSiteResponse.from(sourceSiteRepository.save(sourceSite));
    }

    @Override
    public List<SourceSiteResponse> listByTopic(Long topicId) {
        if (!topicRepository.existsById(topicId)) {
            throw new EntityNotFoundException("Topic not found: " + topicId);
        }
        return sourceSiteRepository.findAllByTopicId(topicId)
                .stream()
                .map(SourceSiteResponse::from)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!sourceSiteRepository.existsById(id)) {
            throw new EntityNotFoundException("Source site not found: " + id);
        }
        sourceSiteRepository.deleteById(id);
    }

    @Override
    public SourceSiteResponse update(Long id, UpdateSourceSiteRequest request) {
        SourceSite site = sourceSiteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Source site not found: " + id));
        site.setUrl(request.url());
        site.setType(request.type());
        return SourceSiteResponse.from(sourceSiteRepository.save(site));
    }
}
