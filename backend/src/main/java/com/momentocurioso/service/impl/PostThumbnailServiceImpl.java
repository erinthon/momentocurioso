package com.momentocurioso.service.impl;

import com.momentocurioso.service.PostThumbnailService;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

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
    public boolean isSupported(String dataUri) {
        return matcher(dataUri).matches();
    }

    private Matcher matcher(String dataUri) {
        return DATA_IMAGE.matcher(dataUri == null ? "" : dataUri);
    }
}
