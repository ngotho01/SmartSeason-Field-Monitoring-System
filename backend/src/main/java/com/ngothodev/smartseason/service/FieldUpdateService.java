package com.ngothodev.smartseason.service;

import com.ngothodev.smartseason.dto.FieldUpdateDtos.*;
import com.ngothodev.smartseason.exception.ForbiddenException;
import com.ngothodev.smartseason.model.*;
import com.ngothodev.smartseason.repository.FieldRepository;
import com.ngothodev.smartseason.repository.FieldUpdateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FieldUpdateService {

    private final FieldUpdateRepository updateRepository;
    private final FieldRepository fieldRepository;
    private final FieldService fieldService;
    private final UserService userService;

    @Transactional
    public UpdateResponse create(Long fieldId, CreateUpdateRequest req, String username) {
        Field f = fieldService.get(fieldId);
        User agent = userService.findByUsername(username);

        if (agent.getRole() == Role.AGENT &&
                (f.getAgent() == null || !f.getAgent().getId().equals(agent.getId()))) {
            throw new ForbiddenException("Not assigned to this field");
        }

        if (req.newStage() != null) {
            f.setCurrentStage(req.newStage());
        }
        f.setLastUpdateAt(LocalDateTime.now());
        fieldRepository.save(f);

        FieldUpdate update = FieldUpdate.builder()
                .field(f)
                .agent(agent)
                .notes(req.notes())
                .newStage(req.newStage())
                .build();
        update = updateRepository.save(update);
        return toDto(update);
    }

    public List<UpdateResponse> listForField(Long fieldId, String username) {
        Field f = fieldService.get(fieldId);
        User user = userService.findByUsername(username);
        if (user.getRole() == Role.AGENT &&
                (f.getAgent() == null || !f.getAgent().getId().equals(user.getId()))) {
            throw new ForbiddenException("Not assigned to this field");
        }
        return updateRepository.findByFieldIdOrderByCreatedAtDesc(fieldId)
                .stream().map(this::toDto).toList();
    }

    public List<UpdateResponse> recentForAdmin() {
        return updateRepository.findTop20ByOrderByCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    public List<UpdateResponse> recentForAgent(Long agentId) {
        return updateRepository.findTop10ByAgentIdOrderByCreatedAtDesc(agentId)
                .stream().map(this::toDto).toList();
    }

    public UpdateResponse toDto(FieldUpdate u) {
        return new UpdateResponse(
                u.getId(),
                u.getField().getId(),
                u.getField().getName(),
                u.getAgent().getId(),
                u.getAgent().getFullName(),
                u.getNotes(),
                u.getNewStage(),
                u.getCreatedAt()
        );
    }
}