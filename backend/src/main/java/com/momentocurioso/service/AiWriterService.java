package com.momentocurioso.service;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.ScrapedArticle;
import com.momentocurioso.entity.Topic;

import java.util.List;

public interface AiWriterService {

    AiGeneratedContent generate(Topic topic, List<ScrapedArticle> articles);
}
