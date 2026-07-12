package com.momentocurioso.dto.request;

import com.momentocurioso.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Criação de usuário pelo painel admin — não existe cadastro público.
 */
public record CreateUserRequest(
        @Email @NotBlank String email,
        @NotBlank
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        )
        String password,
        @NotNull User.Role role
) {}
