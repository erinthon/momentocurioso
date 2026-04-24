package com.momentocurioso.service;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.dto.response.PostSummaryResponse;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.Topic;

import java.util.List;

public interface PostService {

    Post saveDraft(Topic topic, AiGeneratedContent content);

    List<PostSummaryResponse> listPublished(String topicSlug);

    PostResponse getPublishedBySlug(String slug);

    List<PostSummaryResponse> listAll();

    PostResponse approve(Long id);

    PostResponse reject(Long id);
}
