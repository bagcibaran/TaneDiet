package com.project.project.controller;

import com.project.project.dto.DietPlanResponse;
import com.project.project.service.impl.DietPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Danışanın "Menüm" sekmesi: aktif diyet programı
@RestController
@RequestMapping("/diet-plan")
@PreAuthorize("hasRole('CLIENT')")
public class DietPlanController {

    private final DietPlanService dietPlanService;

    public DietPlanController(DietPlanService dietPlanService) {
        this.dietPlanService = dietPlanService;
    }

    // Program henüz yazılmadıysa 204 No Content
    @GetMapping
    public ResponseEntity<DietPlanResponse> getMyActivePlan(Authentication authentication) {
        return dietPlanService.getMyActivePlan(authentication.getName())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
