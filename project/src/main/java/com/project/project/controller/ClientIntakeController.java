package com.project.project.controller;

import com.project.project.dto.IntakeFormResponse;
import com.project.project.service.impl.IntakeFormService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Diyetisyenin bir danışanın ön görüşme formunu görmesi
@RestController
@RequestMapping("/clients/{clientId}/intake")
@PreAuthorize("hasRole('DIETITIAN')")
public class ClientIntakeController {

    private final IntakeFormService intakeFormService;

    public ClientIntakeController(IntakeFormService intakeFormService) {
        this.intakeFormService = intakeFormService;
    }

    // Danışan formu henüz doldurmadıysa 204 No Content
    @GetMapping
    public ResponseEntity<IntakeFormResponse> getClientForm(@PathVariable Long clientId) {
        return intakeFormService.getClientForm(clientId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
