package com.momentocurioso.repository;

import com.momentocurioso.entity.SocialLink;
import com.momentocurioso.entity.SocialPlatform;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {

    List<SocialLink> findAllByOrderByDisplayOrderAscIdAsc();

    List<SocialLink> findAllByActiveTrueOrderByDisplayOrderAscIdAsc();

    Optional<SocialLink> findByPlatform(SocialPlatform platform);

    boolean existsByPlatform(SocialPlatform platform);
}
