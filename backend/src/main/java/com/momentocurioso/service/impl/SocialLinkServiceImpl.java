package com.momentocurioso.service.impl;

import com.momentocurioso.dto.request.SaveSocialLinkRequest;
import com.momentocurioso.dto.response.SocialLinkResponse;
import com.momentocurioso.entity.SocialLink;
import com.momentocurioso.repository.SocialLinkRepository;
import com.momentocurioso.service.SocialLinkService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SocialLinkServiceImpl implements SocialLinkService {

    private final SocialLinkRepository socialLinkRepository;

    public SocialLinkServiceImpl(SocialLinkRepository socialLinkRepository) {
        this.socialLinkRepository = socialLinkRepository;
    }

    @Override
    public List<SocialLinkResponse> findAll() {
        return socialLinkRepository.findAllByOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(SocialLinkResponse::from)
                .toList();
    }

    @Override
    @Cacheable("socialLinks")
    public List<SocialLinkResponse> findActive() {
        return socialLinkRepository.findAllByActiveTrueOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(SocialLinkResponse::from)
                .toList();
    }

    @Override
    @CacheEvict(value = "socialLinks", allEntries = true)
    public SocialLinkResponse create(SaveSocialLinkRequest request) {
        if (socialLinkRepository.existsByPlatform(request.platform())) {
            throw new IllegalArgumentException("Já existe um link para " + request.platform());
        }
        SocialLink link = new SocialLink();
        link.setPlatform(request.platform());
        link.setUrl(request.url());
        link.setActive(request.active());
        link.setDisplayOrder(request.displayOrder());
        return SocialLinkResponse.from(socialLinkRepository.save(link));
    }

    @Override
    @CacheEvict(value = "socialLinks", allEntries = true)
    public SocialLinkResponse update(Long id, SaveSocialLinkRequest request) {
        SocialLink link = socialLinkRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SocialLink not found: " + id));

        socialLinkRepository.findByPlatform(request.platform())
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> {
                    throw new IllegalArgumentException("Já existe um link para " + request.platform());
                });

        link.setPlatform(request.platform());
        link.setUrl(request.url());
        link.setActive(request.active());
        link.setDisplayOrder(request.displayOrder());
        return SocialLinkResponse.from(socialLinkRepository.save(link));
    }

    @Override
    @CacheEvict(value = "socialLinks", allEntries = true)
    public void delete(Long id) {
        if (!socialLinkRepository.existsById(id)) {
            throw new EntityNotFoundException("SocialLink not found: " + id);
        }
        socialLinkRepository.deleteById(id);
    }
}
