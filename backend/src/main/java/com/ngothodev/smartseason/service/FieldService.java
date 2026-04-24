package com.ngothodev.smartseason.service;

import com.ngothodev.smartseason.dto.FieldDtos.*;
import com.ngothodev.smartseason.exception.ForbiddenException;
import com.ngothodev.smartseason.exception.ResourceNotFoundException;
import com.ngothodev.smartseason.model.*;
import com.ngothodev.smartseason.repository.FieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FieldService {

    private final FieldRepository fieldRepository;
    private final UserService userService;
    private final FieldStatusService statusService;

    @Transactional
    public FieldResponse create(CreateFieldRequest req) {
        User agent = req.agentId() != null ? userService.findById(req.agentId()) : null;
        if (agent != null && agent.getRole() != Role.AGENT)
            throw new IllegalArgumentException("Assigned user must have AGENT role");

        Field field = Field.builder()
                .name(req.name())
                .cropType(req.cropType())
                .plantingDate(req.plantingDate())
                .currentStage(FieldStage.PLANTED)
                .agent(agent)
                .build();
        return toDto(fieldRepository.save(field));
    }

    @Transactional
    public FieldResponse update(Long id, UpdateFieldRequest req) {
        Field f = get(id);
        if (req.name() != null) f.setName(req.name());
        if (req.cropType() != null) f.setCropType(req.cropType());
        if (req.plantingDate() != null) f.setPlantingDate(req.plantingDate());
        return toDto(fieldRepository.save(f));
    }

    @Transactional
    public FieldResponse assignAgent(Long fieldId, Long agentId) {
        Field f = get(fieldId);
        User agent = userService.findById(agentId);
        if (agent.getRole() != Role.AGENT)
            throw new IllegalArgumentException("User is not an AGENT");
        f.setAgent(agent);
        return toDto(fieldRepository.save(f));
    }

    public void delete(Long id) {
        Field f = get(id);
        fieldRepository.delete(f);
    }

    public List<FieldResponse> listAll() {
        return fieldRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<FieldResponse> listForAgent(Long agentId) {
        return fieldRepository.findByAgentId(agentId).stream().map(this::toDto).toList();
    }

    public FieldResponse getById(Long id, String username) {
        Field f = get(id);
        User user = userService.findByUsername(username);
        if (user.getRole() == Role.AGENT && (f.getAgent() == null || !f.getAgent().getId().equals(user.getId())))
            throw new ForbiddenException("Not assigned to this field");
        return toDto(f);
    }

    public Field get(Long id) {
        return fieldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Field not found: " + id));
    }

    public FieldResponse toDto(Field f) {
        return new FieldResponse(
                f.getId(),
                f.getName(),
                f.getCropType(),
                f.getPlantingDate(),
                f.getCurrentStage(),
                statusService.compute(f),
                f.getAgent() != null ? f.getAgent().getId() : null,
                f.getAgent() != null ? f.getAgent().getFullName() : null,
                f.getCreatedAt(),
                f.getLastUpdateAt()
        );
    }
}