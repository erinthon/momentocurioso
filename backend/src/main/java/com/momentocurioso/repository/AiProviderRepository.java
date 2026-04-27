package com.momentocurioso.repository;

import com.momentocurioso.entity.AiProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AiProviderRepository extends JpaRepository<AiProvider, Long> {

    List<AiProvider> findAllByOrderByCreatedAtDesc();

    Optional<AiProvider> findFirstByActiveTrue();

    @Modifying
    @Query("UPDATE AiProvider a SET a.active = false")
    void deactivateAll();
}
