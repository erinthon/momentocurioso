package com.momentocurioso.service;

import com.momentocurioso.dto.request.SaveSocialLinkRequest;
import com.momentocurioso.dto.response.SocialLinkResponse;
import com.momentocurioso.entity.SocialLink;
import com.momentocurioso.entity.SocialPlatform;
import com.momentocurioso.repository.SocialLinkRepository;
import com.momentocurioso.service.impl.SocialLinkServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SocialLinkServiceImplTest {

    @Mock
    private SocialLinkRepository socialLinkRepository;

    @InjectMocks
    private SocialLinkServiceImpl socialLinkService;

    private SocialLink link(Long id, SocialPlatform platform, String url, boolean active) {
        SocialLink link = new SocialLink();
        link.setId(id);
        link.setPlatform(platform);
        link.setUrl(url);
        link.setActive(active);
        link.setDisplayOrder(1);
        return link;
    }

    @Test
    void findActiveReturnsOnlyActiveLinks() {
        when(socialLinkRepository.findAllByActiveTrueOrderByDisplayOrderAscIdAsc())
                .thenReturn(List.of(link(1L, SocialPlatform.YOUTUBE, "https://youtube.com/@mc", true)));

        List<SocialLinkResponse> result = socialLinkService.findActive();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).platform()).isEqualTo(SocialPlatform.YOUTUBE);
        assertThat(result.get(0).url()).isEqualTo("https://youtube.com/@mc");
    }

    @Test
    void createPersistsLink() {
        SaveSocialLinkRequest request =
                new SaveSocialLinkRequest(SocialPlatform.INSTAGRAM, "https://instagram.com/mc", true, 2);
        when(socialLinkRepository.existsByPlatform(SocialPlatform.INSTAGRAM)).thenReturn(false);
        when(socialLinkRepository.save(any(SocialLink.class)))
                .thenAnswer(invocation -> {
                    SocialLink saved = invocation.getArgument(0);
                    saved.setId(9L);
                    return saved;
                });

        SocialLinkResponse result = socialLinkService.create(request);

        assertThat(result.id()).isEqualTo(9L);
        assertThat(result.platform()).isEqualTo(SocialPlatform.INSTAGRAM);
        assertThat(result.displayOrder()).isEqualTo(2);
    }

    @Test
    void createRejectsDuplicatePlatform() {
        SaveSocialLinkRequest request =
                new SaveSocialLinkRequest(SocialPlatform.X, "https://x.com/mc", true, 1);
        when(socialLinkRepository.existsByPlatform(SocialPlatform.X)).thenReturn(true);

        assertThatThrownBy(() -> socialLinkService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("X");

        verify(socialLinkRepository, never()).save(any());
    }

    @Test
    void updateChangesUrlAndVisibility() {
        SocialLink existing = link(3L, SocialPlatform.TIKTOK, "https://tiktok.com/@old", true);
        when(socialLinkRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(socialLinkRepository.findByPlatform(SocialPlatform.TIKTOK)).thenReturn(Optional.of(existing));
        when(socialLinkRepository.save(any(SocialLink.class))).thenAnswer(i -> i.getArgument(0));

        SocialLinkResponse result = socialLinkService.update(3L,
                new SaveSocialLinkRequest(SocialPlatform.TIKTOK, "https://tiktok.com/@new", false, 5));

        assertThat(result.url()).isEqualTo("https://tiktok.com/@new");
        assertThat(result.active()).isFalse();
        assertThat(result.displayOrder()).isEqualTo(5);
    }

    @Test
    void updateRejectsPlatformAlreadyUsedByAnotherLink() {
        SocialLink target = link(1L, SocialPlatform.YOUTUBE, "https://youtube.com/@mc", true);
        SocialLink other = link(2L, SocialPlatform.INSTAGRAM, "https://instagram.com/mc", true);
        when(socialLinkRepository.findById(1L)).thenReturn(Optional.of(target));
        when(socialLinkRepository.findByPlatform(SocialPlatform.INSTAGRAM)).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> socialLinkService.update(1L,
                new SaveSocialLinkRequest(SocialPlatform.INSTAGRAM, "https://instagram.com/outro", true, 1)))
                .isInstanceOf(IllegalArgumentException.class);

        verify(socialLinkRepository, never()).save(any());
    }

    @Test
    void updateThrowsWhenLinkNotFound() {
        when(socialLinkRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> socialLinkService.update(404L,
                new SaveSocialLinkRequest(SocialPlatform.X, "https://x.com/mc", true, 1)))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void deleteThrowsWhenLinkNotFound() {
        when(socialLinkRepository.existsById(404L)).thenReturn(false);

        assertThatThrownBy(() -> socialLinkService.delete(404L))
                .isInstanceOf(EntityNotFoundException.class);

        verify(socialLinkRepository, never()).deleteById(any());
    }
}
