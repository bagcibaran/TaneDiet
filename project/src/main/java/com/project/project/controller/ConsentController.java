package com.project.project.controller;

import com.project.project.dto.ConsentAcceptRequest;
import com.project.project.service.impl.ConsentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Danışan güncel açık rıza metnini onaylar (rıza gerektiğinde filtre diğer istekleri 428 ile durdurur)
@RestController
@RequestMapping("/consent")
@PreAuthorize("hasRole('CLIENT')")
public class ConsentController {

    private final ConsentService consentService;

    public ConsentController(ConsentService consentService) {
        this.consentService = consentService;
    }

    @PostMapping
    public ResponseEntity<Void> accept(@Valid @RequestBody ConsentAcceptRequest request, Authentication authentication) {
        consentService.accept(authentication.getName(), request.getVersion());
        return ResponseEntity.noContent().build();
    }
}
