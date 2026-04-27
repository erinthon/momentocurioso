package com.momentocurioso.controller;

import com.momentocurioso.dto.response.PostSummaryResponse;
import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.PostService;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PublicPostController.class)
@AutoConfigureMockMvc(addFilters = false)
class PublicPostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostService postService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    private PostSummaryResponse buildSummary(int i) {
        return new PostSummaryResponse(
                (long) i, "Título " + i, "titulo-" + i, "Resumo " + i,
                "tecnologia", PostStatus.PUBLISHED, LocalDateTime.now(), LocalDateTime.now());
    }

    // ── BUG-012: GET /posts retorna Page com no máximo 12 itens ───────────────

    @Test
    void getPosts_defaultRequest_returnsPageWith12Items() throws Exception {
        List<PostSummaryResponse> posts = IntStream.rangeClosed(1, 12)
                .mapToObj(this::buildSummary).toList();
        var page = new PageImpl<>(posts, PageRequest.of(0, 12), 12);

        when(postService.listPublished(isNull(), any())).thenReturn(page);

        mockMvc.perform(get("/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(12))
                .andExpect(jsonPath("$.totalElements").value(12))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void getPosts_page1_returnsNextPage() throws Exception {
        List<PostSummaryResponse> posts = IntStream.rangeClosed(13, 24)
                .mapToObj(this::buildSummary).toList();
        var page = new PageImpl<>(posts, PageRequest.of(1, 12), 24);

        when(postService.listPublished(isNull(), any())).thenReturn(page);

        mockMvc.perform(get("/posts?page=1&size=12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.number").value(1))
                .andExpect(jsonPath("$.content.length()").value(12));
    }

    @Test
    void getPosts_withTopicSlug_returnsOnlyMatchingPosts() throws Exception {
        List<PostSummaryResponse> posts = List.of(buildSummary(1));
        var page = new PageImpl<>(posts, PageRequest.of(0, 12), 1);

        when(postService.listPublished(any(String.class), any())).thenReturn(page);

        mockMvc.perform(get("/posts?topicSlug=tecnologia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    void getPosts_emptyPage_returns200WithEmptyContent() throws Exception {
        var page = new PageImpl<PostSummaryResponse>(Collections.emptyList(), PageRequest.of(0, 12), 0);

        when(postService.listPublished(isNull(), any())).thenReturn(page);

        mockMvc.perform(get("/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(0))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void getPosts_response_containsTotalElementsField() throws Exception {
        List<PostSummaryResponse> posts = List.of(buildSummary(1), buildSummary(2));
        var page = new PageImpl<>(posts, PageRequest.of(0, 12), 2);

        when(postService.listPublished(isNull(), any())).thenReturn(page);

        mockMvc.perform(get("/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").exists())
                .andExpect(jsonPath("$.totalPages").exists())
                .andExpect(jsonPath("$.last").exists());
    }
}
