package com.ngothodev.smartseason.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    public record AuthResponse(
            String token,
            Long userId,
            String username,
            String fullName,
            String role
    ) {}
}