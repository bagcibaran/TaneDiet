package com.project.project.controller;

import com.project.project.dto.IntakeFormRequest;
import com.project.project.dto.IntakeFormResponse;
import com.project.project.service.impl.IntakeFormService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Danışanın kendi ön görüşme formu
@RestController
@RequestMapping("/intake")
@PreAuthorize("hasRole('CLIENT')")
public class IntakeController {

    private final IntakeFormService intakeFormService;

    public IntakeController(IntakeFormService intakeFormService) {
        this.intakeFormService = intakeFormService;
    }

    // Form yoksa 204 No Content: frontend bunu "henüz doldurulmadı" olarak anlar
    @GetMapping
    public ResponseEntity<IntakeFormResponse> getMyForm(Authentication authentication) {
        return intakeFormService.getMyForm(authentication.getName())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    // Yoksa oluşturur, varsa günceller
    @PutMapping
    public ResponseEntity<IntakeFormResponse> saveMyForm(
            @Valid @RequestBody IntakeFormRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(intakeFormService.saveMyForm(authentication.getName(), request));
    }
}
