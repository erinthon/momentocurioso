package com.momentocurioso.service;

import com.momentocurioso.service.impl.PostThumbnailServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;

@SpringJUnitConfig(PostThumbnailServiceCacheTest.CacheTestConfig.class)
class PostThumbnailServiceCacheTest {

    @Autowired
    private PostThumbnailService service;

    @Test
    void createSocial_worksThroughSpringCacheProxy() throws Exception {
        BufferedImage source = new BufferedImage(480, 270, BufferedImage.TYPE_INT_RGB);
        var encoded = new ByteArrayOutputStream();
        ImageIO.write(source, "jpeg", encoded);
        String dataUri = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(encoded.toByteArray());

        assertThat(service.createSocial("post-slug", dataUri)).isPresent();
        assertThat(service.createSocial("post-slug", dataUri)).isPresent();
    }

    @Configuration
    @EnableCaching
    @Import(PostThumbnailServiceImpl.class)
    static class CacheTestConfig {

        @Bean
        CacheManager cacheManager() {
            return new ConcurrentMapCacheManager("socialThumbnails");
        }
    }
}
