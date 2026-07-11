package com.momentocurioso.service.impl;

import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.repository.PostRepository;
import com.momentocurioso.service.RssFeedService;
import com.rometools.rome.feed.synd.*;
import com.rometools.rome.io.FeedException;
import com.rometools.rome.io.SyndFeedOutput;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
public class RssFeedServiceImpl implements RssFeedService {

    private static final int MAX_ITEMS = 20;

    private final PostRepository postRepository;

    @Value("${app.site-url:http://localhost:4200}")
    private String baseUrl;

    public RssFeedServiceImpl(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Override
    public String buildRssFeed(String topicSlug) {
        var pageable = PageRequest.of(0, MAX_ITEMS, Sort.by("createdAt").descending());
        var posts = topicSlug != null
                ? postRepository.findByTopicSlugAndStatus(topicSlug, PostStatus.PUBLISHED, pageable).getContent()
                : postRepository.findAllByStatus(PostStatus.PUBLISHED, pageable).getContent();

        SyndFeed feed = new SyndFeedImpl();
        feed.setFeedType("rss_2.0");
        feed.setTitle("Momento Curioso");
        feed.setLink(baseUrl + "/blog/posts");
        feed.setDescription("Curiosidades e artigos gerados por IA");
        feed.setEntries(posts.stream().map(this::toEntry).toList());

        try {
            StringWriter writer = new StringWriter();
            new SyndFeedOutput().output(feed, writer);
            return writer.toString();
        } catch (FeedException | java.io.IOException e) {
            throw new RuntimeException("Erro ao gerar RSS feed", e);
        }
    }

    private SyndEntry toEntry(Post post) {
        SyndEntry entry = new SyndEntryImpl();
        entry.setTitle(post.getTitle());
        entry.setLink(baseUrl + "/blog/posts/" + post.getSlug());

        SyndContent description = new SyndContentImpl();
        description.setType("text/plain");
        description.setValue(post.getSummary() != null ? post.getSummary() : "");
        entry.setDescription(description);

        var dateSource = post.getPublishedAt() != null ? post.getPublishedAt() : post.getCreatedAt();
        entry.setPublishedDate(Date.from(dateSource.atZone(ZoneId.systemDefault()).toInstant()));

        if (post.getTopic() != null) {
            SyndCategory category = new SyndCategoryImpl();
            category.setName(post.getTopic().getSlug());
            entry.setCategories(List.of(category));
        }

        return entry;
    }
}
