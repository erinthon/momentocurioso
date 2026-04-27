package com.momentocurioso.service;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.dto.response.PostSummaryResponse;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostService {

    Post saveDraft(Topic topic, AiGeneratedContent content);

    Page<PostSummaryResponse> listPublished(String topicSlug, Pageable pageable);

    PostResponse getPublishedBySlug(String slug);

    List<PostSummaryResponse> listAll();

    PostResponse approve(Long id);

    PostResponse reject(Long id);
}
