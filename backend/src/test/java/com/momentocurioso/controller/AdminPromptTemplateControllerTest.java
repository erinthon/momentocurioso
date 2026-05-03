package com.momentocurioso.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.request.CreatePromptTemplateRequest;
import com.momentocurioso.dto.request.UpdatePromptTemplateRequest;
import com.momentocurioso.dto.response.PromptTemplateResponse;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.PromptTemplateService;
import jakarta.persistence.EntityNotFoundException;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminPromptTemplateController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminPromptTemplateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PromptTemplateService promptTemplateService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    private PromptTemplateResponse sampleResponse(Long id, boolean isDefault) {
        return new PromptTemplateResponse(id, "Template " + id, "texto {{topic_name}}", isDefault,
                LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void listAll_returnsTemplates() throws Exception {
        when(promptTemplateService.findAll()).thenReturn(List.of(sampleResponse(1L, true)));

        mockMvc.perform(get("/admin/prompt-templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].isDefault").value(true));
    }

    @Test
    void create_validRequest_returns201() throws Exception {
        when(promptTemplateService.create(any())).thenReturn(sampleResponse(1L, false));

        mockMvc.perform(post("/admin/prompt-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreatePromptTemplateRequest("Novo", "texto {{topic_name}}"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void create_blankName_returns400() throws Exception {
        mockMvc.perform(post("/admin/prompt-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreatePromptTemplateRequest("", "texto"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void update_validRequest_returns200() throws Exception {
        when(promptTemplateService.update(eq(1L), any())).thenReturn(sampleResponse(1L, false));

        mockMvc.perform(put("/admin/prompt-templates/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UpdatePromptTemplateRequest("Editado", "novo texto"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void update_notFound_returns404() throws Exception {
        when(promptTemplateService.update(eq(99L), any()))
                .thenThrow(new EntityNotFoundException("PromptTemplate not found: 99"));

        mockMvc.perform(put("/admin/prompt-templates/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UpdatePromptTemplateRequest("X", "y"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_existing_returns204() throws Exception {
        doNothing().when(promptTemplateService).delete(1L);

        mockMvc.perform(delete("/admin/prompt-templates/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void delete_defaultTemplate_returns400() throws Exception {
        doThrow(new IllegalStateException("Não é possível excluir o template padrão"))
                .when(promptTemplateService).delete(1L);

        mockMvc.perform(delete("/admin/prompt-templates/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Não é possível excluir o template padrão"));
    }

    @Test
    void setDefault_existing_returns200() throws Exception {
        when(promptTemplateService.setDefault(2L)).thenReturn(sampleResponse(2L, true));

        mockMvc.perform(patch("/admin/prompt-templates/2/default"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isDefault").value(true));
    }
}
