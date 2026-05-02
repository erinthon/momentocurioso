package com.momentocurioso.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.request.TriggerJobRequest;
import com.momentocurioso.dto.response.PostResponse;
import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.JobStatus;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.entity.TriggerSource;
import com.momentocurioso.scheduler.ContentGenerationScheduler;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.ContentGenerationJobService;
import com.momentocurioso.service.PostService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.userdetails.UserDetailsService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminPostController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminPostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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

    // ── BUG-001: Trigger retorna job da chamada atual, sem IndexOutOfBoundsException ──

    @Test
    void trigger_withValidTopicId_returns200WithJobIdAndStatus() throws Exception {
        Topic topic = new Topic();
        topic.setId(1L);
        topic.setSlug("tecnologia");
        topic.setName("Tecnologia");

        ContentGenerationJob job = new ContentGenerationJob();
        job.setId(42L);
        job.setTopic(topic);
        job.setStatus(JobStatus.DONE);
        job.setTriggeredBy(TriggerSource.MANUAL);
        job.setStartedAt(LocalDateTime.now());

        when(scheduler.runForTopic(eq(1L), eq(TriggerSource.MANUAL))).thenReturn(job);

        mockMvc.perform(post("/admin/content/trigger")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TriggerJobRequest(1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.status").value("DONE"));
    }

    @Test
    void trigger_withInvalidTopicId_returns404() throws Exception {
        when(scheduler.runForTopic(eq(9999L), eq(TriggerSource.MANUAL)))
                .thenThrow(new EntityNotFoundException("Topic not found: 9999"));

        mockMvc.perform(post("/admin/content/trigger")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TriggerJobRequest(9999L))))
                .andExpect(status().isNotFound());
    }

    // ── BUG-002: approve/reject via HTTP — posts não-DRAFT retornam 400 ──────

    @Test
    void approvePost_whenStatusIsPublished_returns400WithMessage() throws Exception {
        when(postService.approve(1L))
                .thenThrow(new IllegalStateException(
                        "Only DRAFT posts can be approved, current status: PUBLISHED"));

        mockMvc.perform(patch("/admin/posts/1/approve"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void approvePost_whenStatusIsRejected_returns400WithMessage() throws Exception {
        when(postService.approve(2L))
                .thenThrow(new IllegalStateException(
                        "Only DRAFT posts can be approved, current status: REJECTED"));

        mockMvc.perform(patch("/admin/posts/2/approve"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void approvePost_whenStatusIsDraft_returns200() throws Exception {
        PostResponse response = new PostResponse(
                1L, "Título", "titulo", "Resumo", "<p>Conteúdo</p>", "tecnologia", LocalDateTime.now());
        when(postService.approve(1L)).thenReturn(response);

        mockMvc.perform(patch("/admin/posts/1/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void rejectPost_whenStatusIsRejected_returns400WithMessage() throws Exception {
        when(postService.reject(3L))
                .thenThrow(new IllegalStateException(
                        "Only DRAFT posts can be rejected, current status: REJECTED"));

        mockMvc.perform(patch("/admin/posts/3/reject"))
                .andExpect(status().isBadRequest());
    }
}
