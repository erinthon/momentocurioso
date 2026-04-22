package com.momentocurioso.service;

import com.momentocurioso.dto.request.LoginRequest;
import com.momentocurioso.dto.request.RegisterRequest;
import com.momentocurioso.dto.response.AuthResponse;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
