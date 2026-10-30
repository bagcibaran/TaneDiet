package com.project.project.controller;

import com.project.project.dto.AccessLogResponse;
import com.project.project.dto.ClientDeleteRequest;
import com.project.project.dto.ClientExportResponse;
import com.project.project.service.impl.AccessLogService;
import com.project.project.service.impl.ClientDataService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// KVKK (diyetisyen): danışanın verilerini dışa aktarma, kalıcı silme ve erişim kaydı
@RestController
@RequestMapping("/clients/{clientId}")
@PreAuthorize("hasRole('DIETITIAN')")
public class ClientDataController {

    private final ClientDataService clientDataService;
    private final AccessLogService accessLogService;

    public ClientDataController(ClientDataService clientDataService, AccessLogService accessLogService) {
        this.clientDataService = clientDataService;
        this.accessLogService = accessLogService;
    }

    @GetMapping("/export")
    public ResponseEntity<ClientExportResponse> export(@PathVariable Long clientId, Authentication authentication) {
        return ResponseEntity.ok(clientDataService.export(clientId, authentication.getName()));
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(
            @PathVariable Long clientId,
            @Valid @RequestBody ClientDeleteRequest request,
            Authentication authentication
    ) {
        clientDataService.deleteOnRequest(clientId, authentication.getName(), request.getConfirmUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/access-log")
    public ResponseEntity<List<AccessLogResponse>> accessLog(@PathVariable Long clientId) {
        return ResponseEntity.ok(accessLogService.list(clientId));
    }
}
