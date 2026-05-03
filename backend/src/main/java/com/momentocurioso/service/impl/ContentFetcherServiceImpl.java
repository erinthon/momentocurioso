package com.momentocurioso.service.impl;

import com.momentocurioso.entity.ApprovalStatus;
import com.momentocurioso.entity.ScrapedArticle;
import com.momentocurioso.entity.SourceSite;
import com.momentocurioso.entity.SourceType;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.repository.ScrapedArticleRepository;
import com.momentocurioso.repository.SourceSiteRepository;
import com.momentocurioso.service.ContentFetcherService;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContentFetcherServiceImpl implements ContentFetcherService {

    private static final Logger log = LoggerFactory.getLogger(ContentFetcherServiceImpl.class);

    private final SourceSiteRepository sourceSiteRepository;
    private final ScrapedArticleRepository scrapedArticleRepository;

    public ContentFetcherServiceImpl(SourceSiteRepository sourceSiteRepository,
                                     ScrapedArticleRepository scrapedArticleRepository) {
        this.sourceSiteRepository = sourceSiteRepository;
        this.scrapedArticleRepository = scrapedArticleRepository;
    }

    @Override
    public List<ScrapedArticle> fetchAndSave(Topic topic) {
        List<SourceSite> sites = sourceSiteRepository.findByTopicIdAndActiveTrue(topic.getId());
        List<ScrapedArticle> newlySaved = new ArrayList<>();
        List<String> fetchErrors = new ArrayList<>();

        for (SourceSite site : sites) {
            try {
                List<ScrapedArticle> scraped;
                if (site.getType() == SourceType.RSS) {
                    scraped = fetchRss(site, topic);
                } else {
                    scraped = fetchHtml(site, topic);
                }
                newlySaved.addAll(scraped);
            } catch (Exception e) {
                String msg = "Fonte id=%d (%s): %s".formatted(site.getId(), site.getUrl(), e.getMessage());
                fetchErrors.add(msg);
                log.error("Failed to fetch from source site id={} url={}: {}", site.getId(), site.getUrl(), e.getMessage());
            }
        }

        if (topic.isRequireApproval()) {
            // Return only newly scraped articles. Previously saved PENDING articles
            // await user approval and must not be re-surfaced here on each run.
            if (newlySaved.isEmpty() && !fetchErrors.isEmpty()) {
                throw new RuntimeException("Falha ao buscar artigos das fontes: " + String.join("; ", fetchErrors));
            }
            return newlySaved;
        }

        // Auto-publish topics: return all unused articles (new + leftover from failed runs)
        List<ScrapedArticle> unprocessed = sites.stream()
                .flatMap(s -> scrapedArticleRepository.findBySourceSiteIdAndUsedFalse(s.getId()).stream())
                .collect(Collectors.toList());

        if (unprocessed.isEmpty() && !fetchErrors.isEmpty()) {
            throw new RuntimeException("Falha ao buscar artigos das fontes: " + String.join("; ", fetchErrors));
        }

        if (!fetchErrors.isEmpty()) {
            log.warn("Some sources failed but {} unprocessed article(s) available: {}", unprocessed.size(), fetchErrors);
        }

        return unprocessed;
    }

    @Override
    public List<ScrapedArticle> findApprovedUnused(Topic topic) {
        List<SourceSite> sites = sourceSiteRepository.findByTopicIdAndActiveTrue(topic.getId());
        return sites.stream()
                .flatMap(s -> scrapedArticleRepository
                        .findBySourceSiteIdAndUsedFalseAndApprovalStatus(s.getId(), ApprovalStatus.APPROVED)
                        .stream())
                .collect(Collectors.toList());
    }

    private List<ScrapedArticle> fetchRss(SourceSite site, Topic topic) throws Exception {
        List<ScrapedArticle> results = new ArrayList<>();
        SyndFeedInput input = new SyndFeedInput();
        SyndFeed feed = input.build(new XmlReader(new URL(site.getUrl())));

        for (SyndEntry entry : feed.getEntries()) {
            String url = entry.getLink();
            if (scrapedArticleRepository.existsBySourceUrlAndSourceSiteId(url, site.getId())) {
                continue;
            }

            String title = entry.getTitle();
            String content = entry.getDescription() != null ? entry.getDescription().getValue() : "";

            ScrapedArticle article = buildArticle(site, topic, title, content, url);
            results.add(scrapedArticleRepository.save(article));
        }

        return results;
    }

    private List<ScrapedArticle> fetchHtml(SourceSite site, Topic topic) throws Exception {
        String url = site.getUrl();
        if (scrapedArticleRepository.existsBySourceUrlAndSourceSiteId(url, site.getId())) {
            return List.of();
        }

        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (compatible; MomentoCurioso/1.0)")
                .timeout(10_000)
                .get();

        String title = doc.title();
        Element mainEl = doc.selectFirst("article, main, [role=main], .content, .post-content, #content, #main");
        String content = (mainEl != null ? mainEl : doc.body()).text();

        ScrapedArticle article = buildArticle(site, topic, title, content, url);
        return List.of(scrapedArticleRepository.save(article));
    }

    @Override
    public void markUsed(List<ScrapedArticle> articles) {
        articles.forEach(a -> a.setUsed(true));
        scrapedArticleRepository.saveAll(articles);
    }

    private ScrapedArticle buildArticle(SourceSite site, Topic topic, String title, String content, String url) {
        ScrapedArticle article = new ScrapedArticle();
        article.setSourceSite(site);
        article.setTitle(title != null ? title : "");
        article.setContent(content);
        article.setSourceUrl(url);
        article.setScrapedAt(LocalDateTime.now());
        article.setUsed(false);
        article.setApprovalStatus(topic.isRequireApproval() ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED);
        return article;
    }
}
