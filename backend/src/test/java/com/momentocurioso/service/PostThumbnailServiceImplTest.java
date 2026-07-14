package com.momentocurioso.service;

import com.momentocurioso.service.impl.PostThumbnailServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;

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

    @Test
    void createSocial_resizesAndCropsImageToXDimensions() throws Exception {
        BufferedImage source = new BufferedImage(480, 270, BufferedImage.TYPE_INT_RGB);
        var graphics = source.createGraphics();
        try {
            graphics.setColor(Color.BLUE);
            graphics.fillRect(0, 0, source.getWidth(), source.getHeight());
        } finally {
            graphics.dispose();
        }
        var encoded = new ByteArrayOutputStream();
        ImageIO.write(source, "jpeg", encoded);
        String dataUri = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(encoded.toByteArray());

        var social = service.createSocial("post-slug", dataUri).orElseThrow();
        BufferedImage result = ImageIO.read(new ByteArrayInputStream(social.content()));

        assertThat(social.mediaType()).isEqualTo(MediaType.IMAGE_JPEG);
        assertThat(result.getWidth()).isEqualTo(PostThumbnailService.SOCIAL_WIDTH);
        assertThat(result.getHeight()).isEqualTo(PostThumbnailService.SOCIAL_HEIGHT);
    }

    @Test
    void createSocial_whenPayloadIsNotAnImage_returnsEmpty() {
        assertThat(service.createSocial("post-slug", "data:image/jpeg;base64,AQID"))
                .isEmpty();
    }
}
