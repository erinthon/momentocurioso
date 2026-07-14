package com.momentocurioso.controller;

import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.entity.PostStatus;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.PostPageRenderer;
import com.momentocurioso.service.PostService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PostPageController.class)
@AutoConfigureMockMvc(addFilters = false)
class PostPageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostService postService;

    @MockBean
    private PostPageRenderer postPageRenderer;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void page_returnsRenderedHtmlWithoutLongLivedCache() throws Exception {
        PostResponse post = new PostResponse(
                1L, "Título", "titulo", "Resumo", "<p>Conteúdo</p>", null,
                "tecnologia", PostStatus.PUBLISHED, LocalDateTime.now(), LocalDateTime.now());
        when(postService.getPublishedBySlug("titulo")).thenReturn(post);
        when(postPageRenderer.render(post)).thenReturn("<html><title>Título</title></html>");

        mockMvc.perform(get("/post-pages/titulo"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(content().string("<html><title>Título</title></html>"))
                .andExpect(header().string("Cache-Control", "no-cache"));
    }
}
