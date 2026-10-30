package com.project.project.controller;

import com.project.project.dto.IntakeFormResponse;
import com.project.project.entity.AccessLog;
import com.project.project.service.impl.AccessLogService;
import com.project.project.service.impl.IntakeFormService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
    private final AccessLogService accessLogService;

    public ClientIntakeController(IntakeFormService intakeFormService, AccessLogService accessLogService) {
        this.intakeFormService = intakeFormService;
        this.accessLogService = accessLogService;
    }

    // Danışan formu henüz doldurmadıysa 204 No Content. Form varsa görüntüleme KVKK erişim kaydına yazılır.
    @GetMapping
    public ResponseEntity<IntakeFormResponse> getClientForm(@PathVariable Long clientId, Authentication authentication) {
        return intakeFormService.getClientForm(clientId)
                .map(form -> {
                    accessLogService.record(authentication.getName(), clientId, AccessLog.Action.VIEW_INTAKE);
                    return ResponseEntity.ok(form);
                })
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
