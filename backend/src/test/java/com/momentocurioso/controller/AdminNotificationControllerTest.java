package com.momentocurioso.controller;

import com.momentocurioso.dto.response.NotificationCountsResponse;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminNotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminNotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void getCounts_retornaContagens() throws Exception {
        when(notificationService.getCounts()).thenReturn(new NotificationCountsResponse(5, 2));

        mockMvc.perform(get("/admin/notifications/counts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pendingApproval").value(5))
                .andExpect(jsonPath("$.queued").value(2));
    }

    @Test
    void getCounts_semPendencias_retornaZeros() throws Exception {
        when(notificationService.getCounts()).thenReturn(new NotificationCountsResponse(0, 0));

        mockMvc.perform(get("/admin/notifications/counts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pendingApproval").value(0))
                .andExpect(jsonPath("$.queued").value(0));
    }
}
