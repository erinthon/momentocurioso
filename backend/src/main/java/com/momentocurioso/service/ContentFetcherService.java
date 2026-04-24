package com.momentocurioso.service;

import com.momentocurioso.entity.ScrapedArticle;
import com.momentocurioso.entity.Topic;

import java.util.List;

public interface ContentFetcherService {

    List<ScrapedArticle> fetchAndSave(Topic topic);
}
