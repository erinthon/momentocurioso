package com.momentocurioso.service;

import org.springframework.http.MediaType;

import java.util.Optional;

public interface PostThumbnailService {

    int SOCIAL_WIDTH = 1200;
    int SOCIAL_HEIGHT = 630;

    Optional<PostThumbnail> decode(String dataUri);

    Optional<PostThumbnail> createSocial(String slug, String dataUri);

    boolean isSupported(String dataUri);

    record PostThumbnail(byte[] content, MediaType mediaType) {
    }
}
