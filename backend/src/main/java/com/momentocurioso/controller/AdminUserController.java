package com.momentocurioso.controller;

import com.momentocurioso.dto.request.CreateUserRequest;
import com.momentocurioso.dto.request.UpdateUserRoleRequest;
import com.momentocurioso.dto.response.UserResponse;
import com.momentocurioso.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> listAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateRole(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateUserRoleRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(userService.updateRole(id, request.role(), authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        userService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
