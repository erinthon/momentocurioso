package com.momentocurioso.repository;

import com.momentocurioso.entity.PromptTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PromptTemplateRepository extends JpaRepository<PromptTemplate, Long> {

    Optional<PromptTemplate> findFirstByIsDefaultTrue();

    List<PromptTemplate> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE PromptTemplate p SET p.isDefault = false")
    void clearDefault();
}
