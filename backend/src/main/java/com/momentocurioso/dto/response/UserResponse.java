package com.momentocurioso.dto.response;

import com.momentocurioso.entity.User;

public record UserResponse(
        Long id,
        String email,
        User.Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getRole());
    }
}
