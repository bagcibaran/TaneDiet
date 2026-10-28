package com.project.project.controller;

import com.project.project.dto.ClientAccessRequest;
import com.project.project.dto.ClientAccessResponse;
import com.project.project.service.impl.ClientAccessService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

// Diyetisyen: danışanın hizmet süresi (paket ekle, tarih ayarla, süresiz yap, hemen kapat)
@RestController
@RequestMapping("/clients/{clientId}/access")
@PreAuthorize("hasRole('DIETITIAN')")
public class ClientAccessController {

    private final ClientAccessService clientAccessService;

    public ClientAccessController(ClientAccessService clientAccessService) {
        this.clientAccessService = clientAccessService;
    }

    @GetMapping
    public ResponseEntity<ClientAccessResponse> getAccess(@PathVariable Long clientId) {
        return ResponseEntity.ok(clientAccessService.getAccess(clientId));
    }

    @PutMapping
    public ResponseEntity<ClientAccessResponse> updateAccess(
            @PathVariable Long clientId,
            @Valid @RequestBody ClientAccessRequest request
    ) {
        return ResponseEntity.ok(clientAccessService.updateAccess(clientId, request));
    }
}
