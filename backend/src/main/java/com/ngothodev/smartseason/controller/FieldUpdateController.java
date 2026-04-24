package com.ngothodev.smartseason.controller;

import com.ngothodev.smartseason.dto.FieldUpdateDtos.*;
import com.ngothodev.smartseason.service.FieldUpdateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fields/{fieldId}/updates")
@RequiredArgsConstructor
public class FieldUpdateController {

    private final FieldUpdateService service;

    @GetMapping
    public ResponseEntity<List<UpdateResponse>> list(@PathVariable Long fieldId,
                                                     @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(service.listForField(fieldId, principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<UpdateResponse> create(@PathVariable Long fieldId,
                                                 @Valid @RequestBody CreateUpdateRequest req,
                                                 @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(service.create(fieldId, req, principal.getUsername()));
    }
}