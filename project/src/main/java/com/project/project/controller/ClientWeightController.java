package com.project.project.controller;

import com.project.project.dto.WeightEntryCreateRequest;
import com.project.project.dto.WeightEntryResponse;
import com.project.project.service.impl.WeightEntryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clients/{clientId}/weights")
@PreAuthorize("hasRole('DIETITIAN')")
public class ClientWeightController {

    private final WeightEntryService weightEntryService;

    public ClientWeightController(WeightEntryService weightEntryService) {
        this.weightEntryService = weightEntryService;
    }

    @GetMapping
    public ResponseEntity<List<WeightEntryResponse>> getClientEntries(@PathVariable Long clientId) {
        List<WeightEntryResponse> entries = weightEntryService.getClientEntries(clientId);
        return ResponseEntity.ok(entries);
    }

    @PostMapping
    public ResponseEntity<WeightEntryResponse> addEntryForClient(
            @PathVariable Long clientId,
            @Valid @RequestBody WeightEntryCreateRequest request,
            Authentication authentication
    ) {
        WeightEntryResponse response = weightEntryService.addEntryForClient(
                clientId,
                authentication.getName(),
                request
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> deleteClientEntry(
            @PathVariable Long clientId,
            @PathVariable Long entryId
    ) {
        weightEntryService.deleteClientEntry(clientId, entryId);
        return ResponseEntity.noContent().build();
    }
}