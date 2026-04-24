package com.ngothodev.smartseason.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserDtos {

    public record UserResponse(Long id, String username, String fullName, String role) {}

    public record CreateAgentRequest(
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Size(min = 2, max = 100) String fullName,
            @NotBlank @Size(min = 6, max = 100) String password
    ) {}

    public record AgentWithFieldsResponse(
            Long id,
            String username,
            String fullName,
            long fieldCount
    ) {}
}