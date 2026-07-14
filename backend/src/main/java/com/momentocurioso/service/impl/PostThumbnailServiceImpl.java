package com.momentocurioso.service.impl;

import com.momentocurioso.service.PostThumbnailService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PostThumbnailServiceImpl implements PostThumbnailService {

    private static final Pattern DATA_IMAGE = Pattern.compile(
            "^data:(image/(?:jpeg|png|webp));base64,(.+)$",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    @Override
    public Optional<PostThumbnail> decode(String dataUri) {
        Matcher matcher = matcher(dataUri);
        if (!matcher.matches()) {
            return Optional.empty();
        }

        try {
            byte[] content = Base64.getDecoder().decode(matcher.group(2));
            return Optional.of(new PostThumbnail(content, MediaType.parseMediaType(matcher.group(1))));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    @Override
    @Cacheable(
            value = "socialThumbnails",
            key = "#slug + ':' + (#dataUri == null ? 0 : #dataUri.hashCode())",
            unless = "#result.isEmpty()")
    public Optional<PostThumbnail> createSocial(String slug, String dataUri) {
        return decode(dataUri).flatMap(this::resizeForSocial);
    }

    @Override
    public boolean isSupported(String dataUri) {
        return matcher(dataUri).matches();
    }

    private Matcher matcher(String dataUri) {
        return DATA_IMAGE.matcher(dataUri == null ? "" : dataUri);
    }

    private Optional<PostThumbnail> resizeForSocial(PostThumbnail thumbnail) {
        try (var input = new ByteArrayInputStream(thumbnail.content())) {
            BufferedImage source = ImageIO.read(input);
            if (source == null) {
                return Optional.empty();
            }
            BufferedImage socialImage = renderSocialImage(source);
            var output = new ByteArrayOutputStream();
            if (!ImageIO.write(socialImage, "jpeg", output)) {
                return Optional.empty();
            }
            return Optional.of(new PostThumbnail(output.toByteArray(), MediaType.IMAGE_JPEG));
        } catch (IOException | RuntimeException exception) {
            return Optional.empty();
        }
    }

    private BufferedImage renderSocialImage(BufferedImage source) {
        Crop crop = centerCrop(source);
        BufferedImage target = new BufferedImage(SOCIAL_WIDTH, SOCIAL_HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = target.createGraphics();
        try {
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, SOCIAL_WIDTH, SOCIAL_HEIGHT);
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            graphics.drawImage(source, 0, 0, SOCIAL_WIDTH, SOCIAL_HEIGHT,
                    crop.x(), crop.y(), crop.x() + crop.width(), crop.y() + crop.height(), null);
        } finally {
            graphics.dispose();
        }
        return target;
    }

    private Crop centerCrop(BufferedImage source) {
        double targetRatio = (double) SOCIAL_WIDTH / SOCIAL_HEIGHT;
        int width = source.getWidth();
        int height = (int) Math.round(width / targetRatio);
        if (height <= source.getHeight()) {
            return new Crop(0, (source.getHeight() - height) / 2, width, height);
        }
        height = source.getHeight();
        width = (int) Math.round(height * targetRatio);
        return new Crop((source.getWidth() - width) / 2, 0, width, height);
    }

    private record Crop(int x, int y, int width, int height) {
    }
}
