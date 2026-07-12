package com.momentocurioso.service;

import com.momentocurioso.dto.request.CreateUserRequest;
import com.momentocurioso.dto.request.LoginRequest;
import com.momentocurioso.dto.response.AuthResponse;
import com.momentocurioso.dto.response.UserResponse;
import com.momentocurioso.entity.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService extends UserDetailsService {

    AuthResponse login(LoginRequest request);

    List<UserResponse> findAll();

    /** Criação de conta — só pelo painel admin; não há cadastro público. */
    UserResponse create(CreateUserRequest request);

    /** {@code currentEmail} é quem está logado: ninguém muda o próprio papel. */
    UserResponse updateRole(Long id, User.Role role, String currentEmail);

    /** {@code currentEmail} é quem está logado: ninguém remove a própria conta. */
    void delete(Long id, String currentEmail);
}
