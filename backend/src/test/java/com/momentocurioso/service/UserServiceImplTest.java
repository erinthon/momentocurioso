package com.momentocurioso.service;

import com.momentocurioso.dto.request.CreateUserRequest;
import com.momentocurioso.dto.response.UserResponse;
import com.momentocurioso.entity.User;
import com.momentocurioso.repository.UserRepository;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.impl.UserServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserServiceImpl userService;

    private User user(Long id, String email, User.Role role) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setPassword("hash");
        user.setRole(role);
        return user;
    }

    @Test
    void createHashesPasswordAndAppliesRole() {
        when(userRepository.existsByEmail("novo@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Senha123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(7L);
            return saved;
        });

        UserResponse result = userService.create(
                new CreateUserRequest("novo@example.com", "Senha123", User.Role.WRITER));

        assertThat(result.id()).isEqualTo(7L);
        assertThat(result.role()).isEqualTo(User.Role.WRITER);
        verify(passwordEncoder).encode("Senha123");
    }

    @Test
    void createRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.create(
                new CreateUserRequest("dup@example.com", "Senha123", User.Role.USER)))
                .isInstanceOf(IllegalArgumentException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void deleteRejectsOwnAccount() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "admin@example.com", User.Role.ADMIN)));

        assertThatThrownBy(() -> userService.delete(1L, "admin@example.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("própria conta");

        verify(userRepository, never()).delete(any());
    }

    @Test
    void deleteRemovesOtherAccount() {
        User target = user(2L, "outro@example.com", User.Role.WRITER);
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));

        userService.delete(2L, "admin@example.com");

        verify(userRepository).delete(target);
    }

    @Test
    void deleteThrowsWhenUserNotFound() {
        when(userRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.delete(404L, "admin@example.com"))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void updateRoleRejectsOwnAccount() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "admin@example.com", User.Role.ADMIN)));

        assertThatThrownBy(() -> userService.updateRole(1L, User.Role.USER, "admin@example.com"))
                .isInstanceOf(IllegalArgumentException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void updateRoleChangesOtherAccount() {
        User target = user(2L, "writer@example.com", User.Role.WRITER);
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UserResponse result = userService.updateRole(2L, User.Role.ADMIN, "admin@example.com");

        assertThat(result.role()).isEqualTo(User.Role.ADMIN);
    }
}
