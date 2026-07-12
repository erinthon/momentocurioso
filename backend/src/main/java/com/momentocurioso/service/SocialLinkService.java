package com.momentocurioso.service;

import com.momentocurioso.dto.request.SaveSocialLinkRequest;
import com.momentocurioso.dto.response.SocialLinkResponse;

import java.util.List;

public interface SocialLinkService {

    /** Todos os links, ativos ou não — usado pelo painel admin. */
    List<SocialLinkResponse> findAll();

    /** Apenas os ativos, na ordem de exibição — usado pelo site público. */
    List<SocialLinkResponse> findActive();

    SocialLinkResponse create(SaveSocialLinkRequest request);

    SocialLinkResponse update(Long id, SaveSocialLinkRequest request);

    void delete(Long id);
}
