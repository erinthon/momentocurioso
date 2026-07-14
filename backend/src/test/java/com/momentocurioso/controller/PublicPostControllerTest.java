package com.momentocurioso.controller;

import com.momentocurioso.dto.response.PageResponse;
import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.dto.response.PublicPostSummaryResponse;
import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.PostService;
import com.momentocurioso.service.PostThumbnailService;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PublicPostController.class)
@AutoConfigureMockMvc(addFilters = false)
class PublicPostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostService postService;

    @MockBean
    private PostThumbnailService thumbnailService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    private PublicPostSummaryResponse buildSummary(int i) {
        return new PublicPostSummaryResponse(
                (long) i, "Título " + i, "titulo-" + i, "Resumo " + i, null,
                "tecnologia", PostStatus.PUBLISHED, LocalDateTime.now(), LocalDateTime.now());
    }

    // ── BUG-012: GET /posts retorna Page com no máximo 12 itens ───────────────

    @Test
    void getPosts_defaultRequest_returnsPageWith12Items() throws Exception {
        List<PublicPostSummaryResponse> posts = IntStream.rangeClosed(1, 12)
                .mapToObj(this::buildSummary).toList();
        var pageResponse = PageResponse.from(new PageImpl<>(posts, PageRequest.of(0, 12), 12));

        when(postService.listPublished(isNull(), any())).thenReturn(pageResponse);

        mockMvc.perform(get("/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(12))
                .andExpect(jsonPath("$.totalElements").value(12))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void getPosts_page1_returnsNextPage() throws Exception {
        List<PublicPostSummaryResponse> posts = IntStream.rangeClosed(13, 24)
                .mapToObj(this::buildSummary).toList();
        var pageResponse = PageResponse.from(new PageImpl<>(posts, PageRequest.of(1, 12), 24));

        when(postService.listPublished(isNull(), any())).thenReturn(pageResponse);

        mockMvc.perform(get("/posts?page=1&size=12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.content.length()").value(12));
    }

    @Test
    void getPosts_withTopicSlug_returnsOnlyMatchingPosts() throws Exception {
        List<PublicPostSummaryResponse> posts = List.of(buildSummary(1));
        var pageResponse = PageResponse.from(new PageImpl<>(posts, PageRequest.of(0, 12), 1));

        when(postService.listPublished(any(String.class), any())).thenReturn(pageResponse);

        mockMvc.perform(get("/posts?topicSlug=tecnologia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    void getPosts_emptyPage_returns200WithEmptyContent() throws Exception {
        var pageResponse = PageResponse.from(
                new PageImpl<PublicPostSummaryResponse>(Collections.emptyList(), PageRequest.of(0, 12), 0));

        when(postService.listPublished(isNull(), any())).thenReturn(pageResponse);

        mockMvc.perform(get("/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(0))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void getPosts_response_containsTotalElementsField() throws Exception {
        List<PublicPostSummaryResponse> posts = List.of(buildSummary(1), buildSummary(2));
        var pageResponse = PageResponse.from(new PageImpl<>(posts, PageRequest.of(0, 12), 2));

        when(postService.listPublished(isNull(), any())).thenReturn(pageResponse);

        mockMvc.perform(get("/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").exists())
                .andExpect(jsonPath("$.totalPages").exists())
                .andExpect(jsonPath("$.last").exists());
    }

    @Test
    void getThumbnail_returnsImageWithPublicCache() throws Exception {
        byte[] image = new byte[]{1, 2, 3};
        PostResponse post = new PostResponse(
                1L, "Título", "titulo", "Resumo", "<p>Conteúdo</p>",
                "data:image/png;base64,AQID", "tecnologia", PostStatus.PUBLISHED,
                LocalDateTime.now(), LocalDateTime.now());
        when(postService.getPublishedBySlug("titulo")).thenReturn(post);
        when(thumbnailService.decode(post.thumbnail())).thenReturn(Optional.of(
                new PostThumbnailService.PostThumbnail(image, MediaType.IMAGE_PNG)));

        mockMvc.perform(get("/posts/titulo/thumbnail"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(content().bytes(image))
                .andExpect(header().string("Cache-Control", "max-age=604800, public"));
    }

    @Test
    void getThumbnail_withoutSupportedImage_returns404() throws Exception {
        PostResponse post = new PostResponse(
                1L, "Título", "titulo", "Resumo", "<p>Conteúdo</p>",
                null, "tecnologia", PostStatus.PUBLISHED,
                LocalDateTime.now(), LocalDateTime.now());
        when(postService.getPublishedBySlug("titulo")).thenReturn(post);
        when(thumbnailService.decode(null)).thenReturn(Optional.empty());

        mockMvc.perform(get("/posts/titulo/thumbnail"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getSocialThumbnail_returnsXCompatibleJpeg() throws Exception {
        byte[] image = new byte[]{4, 5, 6};
        PostResponse post = new PostResponse(
                1L, "Título", "titulo", "Resumo", "<p>Conteúdo</p>",
                "data:image/jpeg;base64,AQID", "tecnologia", PostStatus.PUBLISHED,
                LocalDateTime.now(), LocalDateTime.now());
        when(postService.getPublishedBySlug("titulo")).thenReturn(post);
        when(thumbnailService.createSocial("titulo", post.thumbnail())).thenReturn(Optional.of(
                new PostThumbnailService.PostThumbnail(image, MediaType.IMAGE_JPEG)));

        mockMvc.perform(get("/posts/titulo/social-thumbnail"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_JPEG))
                .andExpect(content().bytes(image))
                .andExpect(header().string("Cache-Control", "max-age=604800, public"));
    }
}
