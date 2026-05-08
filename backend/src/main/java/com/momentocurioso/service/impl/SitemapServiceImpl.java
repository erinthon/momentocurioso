package com.momentocurioso.service.impl;

import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.repository.PostRepository;
import com.momentocurioso.repository.TopicRepository;
import com.momentocurioso.service.SitemapService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class SitemapServiceImpl implements SitemapService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Value("${app.site-url:https://momentocurioso.com.br}")
    private String siteUrl;

    private final PostRepository postRepository;
    private final TopicRepository topicRepository;

    public SitemapServiceImpl(PostRepository postRepository, TopicRepository topicRepository) {
        this.postRepository = postRepository;
        this.topicRepository = topicRepository;
    }

    @Override
    public String buildSitemap() {
        StringBuilder xml = new StringBuilder("""
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                """);

        xml.append(url(siteUrl + "/blog/posts", null, "daily", "0.8"));

        topicRepository.findAllByActiveTrue().forEach(topic ->
                xml.append(url(siteUrl + "/blog/posts?topicSlug=" + topic.getSlug(), null, "daily", "0.7"))
        );

        postRepository.findAllByStatusOrderByCreatedAtDesc(PostStatus.PUBLISHED).forEach(post -> {
            String lastmod = post.getPublishedAt() != null ? post.getPublishedAt().format(DATE_FMT) : null;
            xml.append(url(siteUrl + "/blog/posts/" + post.getSlug(), lastmod, "weekly", "0.6"));
        });

        xml.append("</urlset>");
        return xml.toString();
    }

    @Override
    public String buildRobots() {
        return """
                User-agent: *
                Allow: /blog/
                Allow: /feed.xml
                Disallow: /admin/

                Sitemap: %s/api/sitemap.xml
                """.formatted(siteUrl);
    }

    private String url(String loc, String lastmod, String changefreq, String priority) {
        StringBuilder sb = new StringBuilder("  <url>\n");
        sb.append("    <loc>").append(loc).append("</loc>\n");
        if (lastmod != null) sb.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
        sb.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        sb.append("    <priority>").append(priority).append("</priority>\n");
        sb.append("  </url>\n");
        return sb.toString();
    }
}
