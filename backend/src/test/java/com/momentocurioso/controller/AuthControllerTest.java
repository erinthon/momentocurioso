package com.momentocurioso.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.request.RegisterRequest;
import com.momentocurioso.dto.response.AuthResponse;
import com.momentocurioso.security.JwtAuthFilter;
import com.momentocurioso.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    private String body(String email, String password) throws Exception {
        return objectMapper.writeValueAsString(new RegisterRequest(email, password));
    }

    // ── BUG-008: Validação de complexidade de senha no registro ───────────────

    @Test
    void register_withPasswordShorterThan8_returns400() throws Exception {
        // "Ab1" satisfaz maiúscula + minúscula + dígito, mas tem apenas 3 chars
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user@example.com", "Ab1")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withPasswordNoUppercase_returns400() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user@example.com", "abcdefg1")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withPasswordNoLowercase_returns400() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user@example.com", "ABCDEFG1")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withPasswordNoDigit_returns400() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user@example.com", "Abcdefgh")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withValidPassword_returns200() throws Exception {
        when(userService.register(any(RegisterRequest.class)))
                .thenReturn(new AuthResponse("mocked-jwt-token", "USER"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user@example.com", "Senha123")))
                .andExpect(status().isOk());
    }

    @Test
    void register_withInvalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("nao-e-email", "Senha123")))
                .andExpect(status().isBadRequest());
    }
}
