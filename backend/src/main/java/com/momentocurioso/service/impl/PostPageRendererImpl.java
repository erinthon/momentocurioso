package com.momentocurioso.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.service.PostPageRenderer;
import com.momentocurioso.service.PostThumbnailService;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PostPageRendererImpl implements PostPageRenderer {

    private static final Pattern TITLE = Pattern.compile("<title>.*?</title>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern DESCRIPTION = Pattern.compile("<meta\\s+name=\"description\"[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern OPEN_GRAPH = Pattern.compile("<meta\\s+property=\"og:[^\"]+\"[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern TWITTER = Pattern.compile("<meta\\s+name=\"twitter:[^\"]+\"[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern ARTICLE = Pattern.compile("<meta\\s+property=\"article:[^\"]+\"[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern CANONICAL = Pattern.compile("<link\\s+rel=\"canonical\"[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern APP_ROOT = Pattern.compile("<app-root(?:\\s[^>]*)?>.*?</app-root>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    private final Path indexPath;
    private final String siteUrl;
    private final ObjectMapper objectMapper;
    private final PostThumbnailService thumbnailService;

    public PostPageRendererImpl(
            @Value("${app.frontend-index-path:/var/www/momentocurioso/index.csr.html}") String indexPath,
            @Value("${app.site-url}") String siteUrl,
            ObjectMapper objectMapper,
            PostThumbnailService thumbnailService) {
        this.indexPath = Path.of(indexPath);
        this.siteUrl = siteUrl.replaceAll("/+$", "");
        this.objectMapper = objectMapper;
        this.thumbnailService = thumbnailService;
    }

    @Override
    public String render(PostResponse post) {
        String template = readTemplate();
        String url = siteUrl + "/blog/posts/" + post.slug();
        String imageUrl = thumbnailService.isSupported(post.thumbnail())
                ? siteUrl + "/api/posts/" + post.slug() + "/thumbnail"
                : null;

        template = TITLE.matcher(template).replaceFirst("");
        template = DESCRIPTION.matcher(template).replaceAll("");
        template = OPEN_GRAPH.matcher(template).replaceAll("");
        template = TWITTER.matcher(template).replaceAll("");
        template = ARTICLE.matcher(template).replaceAll("");
        template = CANONICAL.matcher(template).replaceAll("");

        String metadata = buildMetadata(post, url, imageUrl);
        String snapshot = buildSnapshot(post);
        template = APP_ROOT.matcher(template).replaceFirst(Matcher.quoteReplacement(snapshot));
        return template.replace("</head>", metadata + "\n</head>");
    }

    private String readTemplate() {
        try {
            return Files.readString(indexPath, StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new UncheckedIOException("Unable to read frontend index at " + indexPath, exception);
        }
    }

    private String buildMetadata(PostResponse post, String url, String imageUrl) {
        String title = escape(post.title());
        String description = escape(post.summary());
        String escapedUrl = escape(url);
        String escapedImageUrl = escape(imageUrl);
        String publishedTag = post.publishedAt() == null ? "" : """
                <meta property="article:published_time" content="%s">
                """.formatted(post.publishedAt());
        String imageTags = imageUrl == null ? "" : """
                <meta property="og:image" content="%s">
                <meta property="og:image:alt" content="%s">
                <meta name="twitter:image" content="%s">
                <meta name="twitter:image:alt" content="%s">
                """.formatted(escapedImageUrl, title, escapedImageUrl, title);

        return """
                <title>%s | Momento Curioso</title>
                <meta name="description" content="%s">
                <link rel="canonical" href="%s">
                <meta property="og:type" content="article">
                <meta property="og:site_name" content="Momento Curioso">
                <meta property="og:title" content="%s">
                <meta property="og:description" content="%s">
                <meta property="og:url" content="%s">
                %s%s<meta name="twitter:card" content="%s">
                <meta name="twitter:title" content="%s">
                <meta name="twitter:description" content="%s">
                <script type="application/ld+json" id="page-structured-data">%s</script>
                <style id="server-post-snapshot-style">
                  .server-post-snapshot{max-width:680px;margin:0 auto;padding:64px 2rem 100px;color:#111827}
                  .server-post-snapshot article>a{color:#0a7c38;text-decoration:none;font:500 13px sans-serif}
                  .server-post-snapshot h1{margin:28px 0 20px;font:800 clamp(30px,4.5vw,48px)/1.1 sans-serif}
                  .server-post-summary{margin-bottom:40px;color:#6b7280;font-size:18px;line-height:1.65}
                  .server-post-content{font-size:17px;line-height:1.85}.server-post-content p{margin:0 0 1.5em}
                  .server-post-content h2,.server-post-content h3{margin:2em 0 .7em;line-height:1.2}
                </style>
                """.formatted(
                title,
                description,
                escapedUrl,
                title,
                description,
                escapedUrl,
                publishedTag,
                imageTags,
                imageUrl == null ? "summary" : "summary_large_image",
                title,
                description,
                structuredData(post, url, imageUrl));
    }

    private String buildSnapshot(PostResponse post) {
        Safelist safelist = Safelist.relaxed().removeTags("img");
        String content = Jsoup.clean(post.content() == null ? "" : post.content(), safelist);
        return """
                <app-root>
                  <main class="server-post-snapshot">
                    <article>
                      <a href="/blog/posts">← Blog</a>
                      <h1>%s</h1>
                      <p class="server-post-summary">%s</p>
                      <div class="server-post-content">%s</div>
                    </article>
                  </main>
                </app-root>
                """.formatted(escape(post.title()), escape(post.summary()), content);
    }

    private String structuredData(PostResponse post, String url, String imageUrl) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("@context", "https://schema.org");
        data.put("@type", "Article");
        data.put("headline", post.title());
        data.put("description", post.summary());
        data.put("mainEntityOfPage", url);
        if (imageUrl != null) {
            data.put("image", imageUrl);
        }
        if (post.publishedAt() != null) {
            data.put("datePublished", post.publishedAt().toString());
        }
        data.put("publisher", Map.of(
                "@type", "Organization",
                "name", "Momento Curioso",
                "url", siteUrl));

        try {
            return objectMapper.writeValueAsString(data).replace("<", "\\u003c");
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize post structured data", exception);
        }
    }

    private String escape(String value) {
        return HtmlUtils.htmlEscape(value == null ? "" : value, StandardCharsets.UTF_8.name());
    }
}
