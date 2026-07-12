package com.momentocurioso.service.impl;

import com.momentocurioso.dto.request.CreateUserRequest;
import com.momentocurioso.dto.request.LoginRequest;
import com.momentocurioso.dto.response.AuthResponse;
import com.momentocurioso.dto.response.UserResponse;
import com.momentocurioso.entity.User;
import com.momentocurioso.repository.UserRepository;
import com.momentocurioso.security.JwtUtil;
import com.momentocurioso.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        return new AuthResponse(jwtUtil.generateToken(user.getEmail(), user.getRole().name()), user.getRole().name());
    }

    @Override
    public List<UserResponse> findAll() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        return UserResponse.from(userRepository.save(user));
    }

    @Override
    public UserResponse updateRole(Long id, User.Role role, String currentEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        if (user.getEmail().equals(currentEmail)) {
            throw new IllegalArgumentException("Não é possível alterar o papel da própria conta");
        }
        user.setRole(role);
        return UserResponse.from(userRepository.save(user));
    }

    @Override
    public void delete(Long id, String currentEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        if (user.getEmail().equals(currentEmail)) {
            throw new IllegalArgumentException("Não é possível remover a própria conta");
        }
        userRepository.delete(user);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }
}
