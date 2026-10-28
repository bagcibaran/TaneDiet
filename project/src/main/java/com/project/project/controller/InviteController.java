package com.project.project.controller;

import com.project.project.dto.InviteCreateRequest;
import com.project.project.dto.InviteResponse;
import com.project.project.service.impl.InviteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Diyetisyenin davet linkleri (ödeme yapan kişiye gönderilir). /auth altında değil: diyetisyen girişi gerekir.
@RestController
@RequestMapping("/invites")
@PreAuthorize("hasRole('DIETITIAN')")
public class InviteController {

    private final InviteService inviteService;

    public InviteController(InviteService inviteService) {
        this.inviteService = inviteService;
    }

    @PostMapping
    public ResponseEntity<InviteResponse> createInvite(
            @Valid @RequestBody InviteCreateRequest request,
            Authentication authentication
    ) {
        InviteResponse invite = inviteService.create(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(invite);
    }

    // Açık davetler (kullanılmamış, süresi dolmamış)
    @GetMapping
    public ResponseEntity<List<InviteResponse>> listInvites() {
        return ResponseEntity.ok(inviteService.listOpen());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvite(@PathVariable Long id) {
        inviteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
