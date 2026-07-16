package com.momentocurioso.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.request.SubscribeNewsletterRequest;
import com.momentocurioso.dto.response.NewsletterMessageResponse;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.NewsletterSubscriptionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NewsletterController.class)
@AutoConfigureMockMvc(addFilters = false)
class NewsletterControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean NewsletterSubscriptionService subscriptionService;
    @MockBean JwtUtil jwtUtil;
    @MockBean UserDetailsService userDetailsService;

    @Test
    void subscribeReturnsAccepted() throws Exception {
        when(subscriptionService.subscribe(any())).thenReturn(new NewsletterMessageResponse("Verifique seu e-mail"));

        mockMvc.perform(post("/newsletter/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new SubscribeNewsletterRequest("leitor@example.com", "Ana", true, ""))))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").value("Verifique seu e-mail"));
    }

    @Test
    void subscribeRequiresConsent() throws Exception {
        mockMvc.perform(post("/newsletter/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new SubscribeNewsletterRequest("leitor@example.com", null, false, null))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void confirmRequiresToken() throws Exception {
        mockMvc.perform(post("/newsletter/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"\"}"))
                .andExpect(status().isBadRequest());
    }
}
