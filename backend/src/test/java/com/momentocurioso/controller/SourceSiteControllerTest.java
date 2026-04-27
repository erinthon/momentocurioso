package com.momentocurioso.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.response.SourceSiteResponse;
import com.momentocurioso.entity.SourceType;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.SourceSiteService;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SourceSiteController.class)
@AutoConfigureMockMvc(addFilters = false)
class SourceSiteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SourceSiteService sourceSiteService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    private String body(String url) throws Exception {
        return objectMapper.writeValueAsString(
                Map.of("topicId", 1, "url", url, "type", "RSS"));
    }

    // ── BUG-006: URL de fonte deve rejeitar valores sem protocolo http(s) ─────

    @Test
    void createSource_withJavascriptUrl_returns400() throws Exception {
        mockMvc.perform(post("/admin/sources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("javascript:alert(1)")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createSource_withDataUrl_returns400() throws Exception {
        mockMvc.perform(post("/admin/sources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("data:text/html,<script>alert(1)</script>")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createSource_withRelativeUrl_returns400() throws Exception {
        mockMvc.perform(post("/admin/sources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("/relative/path/feed.rss")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createSource_withPlainString_returns400() throws Exception {
        mockMvc.perform(post("/admin/sources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("not-a-url")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createSource_withHttpUrl_returns201() throws Exception {
        when(sourceSiteService.create(any()))
                .thenReturn(new SourceSiteResponse(1L, 1L, "Tecnologia",
                        "http://example.com/feed.rss", SourceType.RSS, true));

        mockMvc.perform(post("/admin/sources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("http://example.com/feed.rss")))
                .andExpect(status().isCreated());
    }

    @Test
    void createSource_withHttpsUrl_returns201() throws Exception {
        when(sourceSiteService.create(any()))
                .thenReturn(new SourceSiteResponse(2L, 1L, "Tecnologia",
                        "https://feeds.example.com/rss", SourceType.RSS, true));

        mockMvc.perform(post("/admin/sources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("https://feeds.example.com/rss")))
                .andExpect(status().isCreated());
    }
}
