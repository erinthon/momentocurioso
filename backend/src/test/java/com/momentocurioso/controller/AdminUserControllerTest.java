package com.momentocurioso.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentocurioso.dto.request.CreateUserRequest;
import com.momentocurioso.dto.request.UpdateUserRoleRequest;
import com.momentocurioso.dto.response.UserResponse;
import com.momentocurioso.entity.User;
import com.momentocurioso.security.JwtAuthFilter;
import com.momentocurioso.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminUserController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    /** UserService já é um UserDetailsService; mockar o filtro evita a ambiguidade de bean. */
    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    /** Com addFilters=false não há cadeia do Security: o principal vai explícito na request. */
    private final Authentication loggedAdmin = new UsernamePasswordAuthenticationToken(
            "admin@example.com", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

    private String createBody(String email, String password, User.Role role) throws Exception {
        return objectMapper.writeValueAsString(new CreateUserRequest(email, password, role));
    }

    @Test
    void listAllReturnsUsers() throws Exception {
        when(userService.findAll()).thenReturn(List.of(
                new UserResponse(1L, "admin@example.com", User.Role.ADMIN),
                new UserResponse(2L, "writer@example.com", User.Role.WRITER)
        ));

        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("admin@example.com"))
                .andExpect(jsonPath("$[1].role").value("WRITER"));
    }

    @Test
    void createReturns201() throws Exception {
        when(userService.create(any(CreateUserRequest.class)))
                .thenReturn(new UserResponse(3L, "novo@example.com", User.Role.WRITER));

        mockMvc.perform(post("/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody("novo@example.com", "Senha123", User.Role.WRITER)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.role").value("WRITER"));
    }

    // ── política de senha (antes no cadastro público, agora só aqui) ──────────

    @Test
    void createWithPasswordShorterThan8Returns400() throws Exception {
        mockMvc.perform(post("/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody("user@example.com", "Ab1", User.Role.USER)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWithPasswordNoUppercaseReturns400() throws Exception {
        mockMvc.perform(post("/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody("user@example.com", "abcdefg1", User.Role.USER)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWithPasswordNoLowercaseReturns400() throws Exception {
        mockMvc.perform(post("/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody("user@example.com", "ABCDEFG1", User.Role.USER)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWithPasswordNoDigitReturns400() throws Exception {
        mockMvc.perform(post("/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody("user@example.com", "Abcdefgh", User.Role.USER)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWithInvalidEmailReturns400() throws Exception {
        mockMvc.perform(post("/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody("nao-e-email", "Senha123", User.Role.USER)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateRolePassesLoggedUserToService() throws Exception {
        when(userService.updateRole(eq(2L), eq(User.Role.ADMIN), eq("admin@example.com")))
                .thenReturn(new UserResponse(2L, "writer@example.com", User.Role.ADMIN));

        mockMvc.perform(patch("/admin/users/2/role")
                        .principal(loggedAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateUserRoleRequest(User.Role.ADMIN))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void deleteReturns204() throws Exception {
        mockMvc.perform(delete("/admin/users/2").principal(loggedAdmin))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteOwnAccountReturns400() throws Exception {
        doThrow(new IllegalArgumentException("Não é possível remover a própria conta"))
                .when(userService).delete(eq(1L), eq("admin@example.com"));

        mockMvc.perform(delete("/admin/users/1").principal(loggedAdmin))
                .andExpect(status().isBadRequest());
    }
}
