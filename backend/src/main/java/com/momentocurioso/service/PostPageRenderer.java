package com.momentocurioso.service;

import com.momentocurioso.dto.response.PostResponse;

public interface PostPageRenderer {

    String render(PostResponse post);
}
