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
@RequestMapping("/weights")
@PreAuthorize("hasRole('CLIENT')")
public class WeightEntryController {

    private final WeightEntryService weightEntryService;

    public WeightEntryController(WeightEntryService weightEntryService) {
        this.weightEntryService = weightEntryService;
    }

    @PostMapping
    public ResponseEntity<WeightEntryResponse> addMyEntry(
            @Valid @RequestBody WeightEntryCreateRequest request,
            Authentication authentication
    ) {
        WeightEntryResponse response = weightEntryService.addMyEntry(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<WeightEntryResponse>> getMyEntries(Authentication authentication) {
        List<WeightEntryResponse> entries = weightEntryService.getMyEntries(authentication.getName());
        return ResponseEntity.ok(entries);
    }
}