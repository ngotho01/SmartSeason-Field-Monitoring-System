package com.ngothodev.smartseason.dto;

import com.ngothodev.smartseason.model.FieldStage;
import com.ngothodev.smartseason.model.FieldStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class FieldDtos {

    public record CreateFieldRequest(
            @NotBlank String name,
            @NotBlank String cropType,
            @NotNull LocalDate plantingDate,
            Long agentId
    ) {}

    public record UpdateFieldRequest(
            String name,
            String cropType,
            LocalDate plantingDate
    ) {}

    public record AssignAgentRequest(@NotNull Long agentId) {}

    public record FieldResponse(
            Long id,
            String name,
            String cropType,
            LocalDate plantingDate,
            FieldStage currentStage,
            FieldStatus status,
            Long agentId,
            String agentName,
            LocalDateTime createdAt,
            LocalDateTime lastUpdateAt
    ) {}
}