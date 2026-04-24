package com.ngothodev.smartseason.dto;

import com.ngothodev.smartseason.model.FieldStage;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class FieldUpdateDtos {

    public record CreateUpdateRequest(
            @NotBlank String notes,
            FieldStage newStage
    ) {}

    public record UpdateResponse(
            Long id,
            Long fieldId,
            String fieldName,
            Long agentId,
            String agentName,
            String notes,
            FieldStage newStage,
            LocalDateTime createdAt
    ) {}
}