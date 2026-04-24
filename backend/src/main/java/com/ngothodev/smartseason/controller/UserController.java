package com.ngothodev.smartseason.controller;

import com.ngothodev.smartseason.dto.UserDtos.*;
import com.ngothodev.smartseason.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/agents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> agents() {
        return ResponseEntity.ok(userService.listAgents());
    }

    @GetMapping("/agents/detailed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AgentWithFieldsResponse>> agentsDetailed() {
        return ResponseEntity.ok(userService.listAgentsWithFieldCount());
    }

    @PostMapping("/agents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createAgent(@Valid @RequestBody CreateAgentRequest req) {
        return ResponseEntity.ok(userService.createAgent(req));
    }

    @DeleteMapping("/agents/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        userService.deleteAgent(id);
        return ResponseEntity.noContent().build();
    }
}