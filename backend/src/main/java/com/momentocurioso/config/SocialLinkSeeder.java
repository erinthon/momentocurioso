package com.momentocurioso.config;

import com.momentocurioso.entity.SocialLink;
import com.momentocurioso.entity.SocialPlatform;
import com.momentocurioso.repository.SocialLinkRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Popula as redes sociais na primeira subida. Só insere o que ainda não existe,
 * então nunca sobrescreve uma URL editada pelo admin.
 */
@Component
public class SocialLinkSeeder implements ApplicationRunner {

    private static final Map<SocialPlatform, String> DEFAULTS = new LinkedHashMap<>() {{
        put(SocialPlatform.YOUTUBE, "https://www.youtube.com/@momentocurioso6873");
        put(SocialPlatform.INSTAGRAM, "https://www.instagram.com/momentocurioso.ia");
        put(SocialPlatform.X, "https://x.com/momentocuriosoA");
        put(SocialPlatform.TIKTOK, "https://www.tiktok.com/@momentocurioso.ia");
    }};

    private final SocialLinkRepository socialLinkRepository;

    public SocialLinkSeeder(SocialLinkRepository socialLinkRepository) {
        this.socialLinkRepository = socialLinkRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        int order = 0;
        for (Map.Entry<SocialPlatform, String> entry : DEFAULTS.entrySet()) {
            order++;
            if (socialLinkRepository.existsByPlatform(entry.getKey())) {
                continue;
            }
            SocialLink link = new SocialLink();
            link.setPlatform(entry.getKey());
            link.setUrl(entry.getValue());
            link.setActive(true);
            link.setDisplayOrder(order);
            socialLinkRepository.save(link);
        }
    }
}
