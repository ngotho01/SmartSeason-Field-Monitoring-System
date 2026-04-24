package com.ngothodev.smartseason.controller;

import com.ngothodev.smartseason.dto.FieldDtos.*;
import com.ngothodev.smartseason.model.Role;
import com.ngothodev.smartseason.service.FieldService;
import com.ngothodev.smartseason.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fields")
@RequiredArgsConstructor
public class FieldController {

    private final FieldService fieldService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<FieldResponse>> list(@AuthenticationPrincipal UserDetails principal) {
        var user = userService.findByUsername(principal.getUsername());
        if (user.getRole() == Role.ADMIN) return ResponseEntity.ok(fieldService.listAll());
        return ResponseEntity.ok(fieldService.listForAgent(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FieldResponse> get(@PathVariable Long id,
                                             @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(fieldService.getById(id, principal.getUsername()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FieldResponse> create(@Valid @RequestBody CreateFieldRequest req) {
        return ResponseEntity.ok(fieldService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FieldResponse> update(@PathVariable Long id,
                                                @RequestBody UpdateFieldRequest req) {
        return ResponseEntity.ok(fieldService.update(id, req));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FieldResponse> assign(@PathVariable Long id,
                                                @Valid @RequestBody AssignAgentRequest req) {
        return ResponseEntity.ok(fieldService.assignAgent(id, req.agentId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        fieldService.delete(id);
        return ResponseEntity.noContent().build();
    }
}