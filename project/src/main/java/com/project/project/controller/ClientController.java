package com.project.project.controller;

import com.project.project.dto.ClientActivityResponse;
import com.project.project.dto.ClientOverviewResponse;
import com.project.project.service.impl.ClientReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Diyetisyenin danışan listesi ve bildirimleri
@RestController
@RequestMapping("/clients")
@PreAuthorize("hasRole('DIETITIAN')")
public class ClientController {

    private final ClientReviewService clientReviewService;

    public ClientController(ClientReviewService clientReviewService) {
        this.clientReviewService = clientReviewService;
    }

    // Danışan kartları + bildirimler
    @GetMapping
    public ResponseEntity<List<ClientOverviewResponse>> listClients() {
        return ResponseEntity.ok(clientReviewService.listClients());
    }

    // Danışanın sayfasında neyin yeni olduğu (görüldü yapmaz)
    @GetMapping("/{clientId}/activity")
    public ResponseEntity<ClientActivityResponse> getActivity(@PathVariable Long clientId) {
        return ResponseEntity.ok(clientReviewService.getActivity(clientId));
    }

    // Diyetisyen sayfayı açtı: bildirimler kaybolur
    @PostMapping("/{clientId}/review")
    public ResponseEntity<Void> markReviewed(@PathVariable Long clientId) {
        clientReviewService.markReviewed(clientId);
        return ResponseEntity.noContent().build();
    }
}
