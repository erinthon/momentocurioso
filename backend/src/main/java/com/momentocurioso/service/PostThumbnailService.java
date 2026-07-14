package com.momentocurioso.service;

import org.springframework.http.MediaType;

import java.util.Optional;

public interface PostThumbnailService {

    Optional<PostThumbnail> decode(String dataUri);

    boolean isSupported(String dataUri);

    record PostThumbnail(byte[] content, MediaType mediaType) {
    }
}
