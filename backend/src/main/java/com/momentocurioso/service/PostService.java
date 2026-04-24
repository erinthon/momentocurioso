package com.momentocurioso.service;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.Topic;

public interface PostService {

    Post saveDraft(Topic topic, AiGeneratedContent content);
}
