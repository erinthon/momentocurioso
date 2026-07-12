package com.momentocurioso.dto.request;

import com.momentocurioso.entity.User;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(@NotNull User.Role role) {}
