package com.momentocurioso.controller;

import com.momentocurioso.config.SecurityConfig;
import com.momentocurioso.scheduler.ContentGenerationScheduler;
import com.momentocurioso.security.JwtAuthFilter;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.ContentGenerationJobService;
import com.momentocurioso.service.PostService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testa as regras de autorização do SecurityConfig com o filter chain real
 * (diferente dos demais controller tests, que desligam os filtros).
 * Cobre a issue #4: WRITER restrito a /admin/posts/**.
 */
@WebMvcTest(AdminPostController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
@TestPropertySource(properties = "app.cors.allowed-origins=http://localhost:4200")
class AdminAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostService postService;

    @MockBean
    private ContentGenerationJobService jobService;

    @MockBean
    private ContentGenerationScheduler scheduler;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    private static final String VALID_POST_JSON = """
            {"title":"Titulo","summary":"Resumo","content":"Conteudo","topicSlug":"ciencia","publish":false}
            """;

    // ── WRITER pode gerenciar posts ──

    @Test
    @WithMockUser(roles = "WRITER")
    void writerCanCreatePost() throws Exception {
        mockMvc.perform(post("/admin/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_POST_JSON))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "WRITER")
    void writerCanListPosts() throws Exception {
        mockMvc.perform(get("/admin/posts"))
                .andExpect(status().isOk());
    }

    // ── WRITER é barrado no restante do /admin ──

    @Test
    @WithMockUser(roles = "WRITER")
    void writerCannotTriggerGeneration() throws Exception {
        mockMvc.perform(post("/admin/content/trigger")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"topicId\":1}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "WRITER")
    void writerCannotListJobs() throws Exception {
        mockMvc.perform(get("/admin/jobs"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "WRITER")
    void writerCannotReachOtherAdminResources() throws Exception {
        mockMvc.perform(get("/admin/topics"))
                .andExpect(status().isForbidden());
    }

    // ── ADMIN mantém acesso total; USER e anônimo continuam barrados ──

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminStillHasFullAccess() throws Exception {
        mockMvc.perform(get("/admin/posts")).andExpect(status().isOk());
        mockMvc.perform(get("/admin/jobs")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void regularUserCannotManagePosts() throws Exception {
        mockMvc.perform(get("/admin/posts"))
                .andExpect(status().isForbidden());
    }

    @Test
    void anonymousCannotManagePosts() throws Exception {
        mockMvc.perform(get("/admin/posts"))
                .andExpect(status().isForbidden());
    }
}
