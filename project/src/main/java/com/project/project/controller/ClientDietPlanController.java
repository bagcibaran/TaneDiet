package com.project.project.controller;

import com.project.project.dto.DietPlanRequest;
import com.project.project.dto.DietPlanResponse;
import com.project.project.service.impl.DietPlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Diyetisyenin bir danışana yazdığı diyet programları
@RestController
@RequestMapping("/clients/{clientId}/diet-plans")
@PreAuthorize("hasRole('DIETITIAN')")
public class ClientDietPlanController {

    private final DietPlanService dietPlanService;

    public ClientDietPlanController(DietPlanService dietPlanService) {
        this.dietPlanService = dietPlanService;
    }

    // En yeni önce; ilki aktif program
    @GetMapping
    public ResponseEntity<List<DietPlanResponse>> listPlans(@PathVariable Long clientId) {
        return ResponseEntity.ok(dietPlanService.listClientPlans(clientId));
    }

    @PostMapping
    public ResponseEntity<DietPlanResponse> createPlan(
            @PathVariable Long clientId,
            @Valid @RequestBody DietPlanRequest request,
            Authentication authentication
    ) {
        DietPlanResponse plan = dietPlanService.createPlan(clientId, authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(plan);
    }

    @PutMapping("/{planId}")
    public ResponseEntity<DietPlanResponse> updatePlan(
            @PathVariable Long clientId,
            @PathVariable Long planId,
            @Valid @RequestBody DietPlanRequest request
    ) {
        return ResponseEntity.ok(dietPlanService.updatePlan(clientId, planId, request));
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long clientId, @PathVariable Long planId) {
        dietPlanService.deletePlan(clientId, planId);
        return ResponseEntity.noContent().build();
    }
}
