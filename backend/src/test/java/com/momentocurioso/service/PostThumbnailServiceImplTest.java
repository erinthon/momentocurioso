package com.momentocurioso.service;

import com.momentocurioso.service.impl.PostThumbnailServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;

class PostThumbnailServiceImplTest {

    private final PostThumbnailServiceImpl service = new PostThumbnailServiceImpl();

    @Test
    void decode_supportedPng_returnsBinaryPayload() {
        var thumbnail = service.decode("data:image/png;base64,AQID").orElseThrow();

        assertThat(thumbnail.mediaType()).isEqualTo(MediaType.IMAGE_PNG);
        assertThat(thumbnail.content()).containsExactly(1, 2, 3);
    }

    @Test
    void decode_svgOrMissingImage_returnsEmpty() {
        assertThat(service.decode("data:image/svg+xml;base64,PHN2Zz4=")).isEmpty();
        assertThat(service.decode(null)).isEmpty();
    }

    @Test
    void decode_invalidBase64_returnsEmpty() {
        assertThat(service.decode("data:image/jpeg;base64,%%%"))
                .isEmpty();
    }
}
