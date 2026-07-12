package com.momentocurioso.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.request.SaveSocialLinkRequest;
import com.momentocurioso.dto.response.SocialLinkResponse;
import com.momentocurioso.entity.SocialPlatform;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.SocialLinkService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminSocialLinkController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminSocialLinkControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SocialLinkService socialLinkService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void listAllReturnsLinks() throws Exception {
        when(socialLinkService.findAll()).thenReturn(List.of(
                new SocialLinkResponse(1L, SocialPlatform.YOUTUBE, "https://youtube.com/@mc", true, 1)
        ));

        mockMvc.perform(get("/admin/social-links"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].platform").value("YOUTUBE"))
                .andExpect(jsonPath("$[0].url").value("https://youtube.com/@mc"));
    }

    @Test
    void createReturns201() throws Exception {
        SaveSocialLinkRequest request =
                new SaveSocialLinkRequest(SocialPlatform.INSTAGRAM, "https://instagram.com/mc", true, 2);
        when(socialLinkService.create(any()))
                .thenReturn(new SocialLinkResponse(2L, SocialPlatform.INSTAGRAM, "https://instagram.com/mc", true, 2));

        mockMvc.perform(post("/admin/social-links")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2));
    }

    @Test
    void createRejectsNonHttpsUrl() throws Exception {
        SaveSocialLinkRequest request =
                new SaveSocialLinkRequest(SocialPlatform.INSTAGRAM, "javascript:alert(1)", true, 1);

        mockMvc.perform(post("/admin/social-links")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateReturnsUpdatedLink() throws Exception {
        SaveSocialLinkRequest request =
                new SaveSocialLinkRequest(SocialPlatform.X, "https://x.com/novo", false, 3);
        when(socialLinkService.update(eq(5L), any()))
                .thenReturn(new SocialLinkResponse(5L, SocialPlatform.X, "https://x.com/novo", false, 3));

        mockMvc.perform(put("/admin/social-links/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://x.com/novo"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void deleteReturns204() throws Exception {
        mockMvc.perform(delete("/admin/social-links/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteReturns404WhenMissing() throws Exception {
        doThrow(new EntityNotFoundException("SocialLink not found: 99"))
                .when(socialLinkService).delete(99L);

        mockMvc.perform(delete("/admin/social-links/99"))
                .andExpect(status().isNotFound());
    }
}
