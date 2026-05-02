package com.momentocurioso.service;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.dto.request.UpdatePostRequest;
import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.dto.response.PostSummaryResponse;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.entity.Topic;
import org.springframework.data.domain.Pageable;

public interface PostService {

    Post saveDraft(Topic topic, AiGeneratedContent content);

    PageResponse<PostSummaryResponse> listPublished(String topicSlug, Pageable pageable);

    PageResponse<PostSummaryResponse> listAllAdmin(PostStatus status, Pageable pageable);

    PostResponse getPublishedBySlug(String slug);

    PostResponse findAdminById(Long id);

    PostResponse approve(Long id);

    PostResponse reject(Long id);

    PostResponse unpublish(Long id);

    PostResponse update(Long id, UpdatePostRequest request);

    void delete(Long id);
}
