package com.ngothodev.smartseason.controller;

import com.ngothodev.smartseason.dto.DashboardDtos.*;
import com.ngothodev.smartseason.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboard> admin() {
        return ResponseEntity.ok(dashboardService.forAdmin());
    }

    @GetMapping("/agent")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<AgentDashboard> agent(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(dashboardService.forAgent(principal.getUsername()));
    }
}