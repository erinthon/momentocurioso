package com.momentocurioso.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.request.GenerateFromQueueRequest;
import com.momentocurioso.dto.response.JobStatusResponse;
import com.momentocurioso.entity.JobStatus;
import com.momentocurioso.entity.TriggerSource;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.AiWriterQueueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminAiWriterController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminAiWriterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AiWriterQueueService aiWriterQueueService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    private JobStatusResponse doneJobResponse() {
        return new JobStatusResponse(
                10L, "tecnologia", JobStatus.DONE, TriggerSource.MANUAL,
                LocalDateTime.now(), LocalDateTime.now(), null, 99L, 1, 1, 0, null);
    }

    @Test
    void generate_withMockTrueAndNoProvider_returns200() throws Exception {
        when(aiWriterQueueService.generateFromQueue(any())).thenReturn(doneJobResponse());

        mockMvc.perform(post("/admin/ai-writer/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("topicId", 1, "articleIds", List.of(5), "mock", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));
    }

    @Test
    void generate_withMockFalseAndNoProvider_returns400() throws Exception {
        mockMvc.perform(post("/admin/ai-writer/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("topicId", 1, "articleIds", List.of(5), "mock", false))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void generate_withMockFalseAndValidProvider_returns200() throws Exception {
        when(aiWriterQueueService.generateFromQueue(any())).thenReturn(doneJobResponse());

        mockMvc.perform(post("/admin/ai-writer/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("topicId", 1, "aiProviderId", 2, "articleIds", List.of(5), "mock", false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.postId").value(99));
    }

    @Test
    void generate_withNullTopicId_returns400() throws Exception {
        mockMvc.perform(post("/admin/ai-writer/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("aiProviderId", 2, "articleIds", List.of(5), "mock", false))))
                .andExpect(status().isBadRequest());
    }
}
