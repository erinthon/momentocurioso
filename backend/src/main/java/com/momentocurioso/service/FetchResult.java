package com.momentocurioso.service;

import com.momentocurioso.entity.ScrapedArticle;

import java.util.List;

public record FetchResult(List<ScrapedArticle> articles, int skippedCount) {}
