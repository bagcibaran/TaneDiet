package com.project.project.controller;

import com.project.project.dto.DietLibraryResponse;
import com.project.project.dto.MealTemplateRequest;
import com.project.project.dto.MealTemplateResponse;
import com.project.project.dto.QuickPickCategoryRequest;
import com.project.project.dto.QuickPickCategoryResponse;
import com.project.project.dto.QuickPickItemRequest;
import com.project.project.dto.QuickPickItemResponse;
import com.project.project.service.impl.DietLibraryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Diyetisyenin hazır öğünleri ve hızlı maddeleri ("Hazırlar"). Sahibi her zaman token'daki kullanıcı.
@RestController
@RequestMapping("/diet-library")
@PreAuthorize("hasRole('DIETITIAN')")
public class DietLibraryController {

    private final DietLibraryService dietLibraryService;

    public DietLibraryController(DietLibraryService dietLibraryService) {
        this.dietLibraryService = dietLibraryService;
    }

    @GetMapping
    public ResponseEntity<DietLibraryResponse> getLibrary(Authentication authentication) {
        return ResponseEntity.ok(dietLibraryService.getLibrary(authentication.getName()));
    }

    // ---------- Hazır öğünler ----------

    @PostMapping("/meals")
    public ResponseEntity<MealTemplateResponse> createMeal(
            @Valid @RequestBody MealTemplateRequest request,
            Authentication authentication
    ) {
        MealTemplateResponse meal = dietLibraryService.createMeal(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(meal);
    }

    @PutMapping("/meals/{id}")
    public ResponseEntity<MealTemplateResponse> updateMeal(
            @PathVariable Long id,
            @Valid @RequestBody MealTemplateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(dietLibraryService.updateMeal(authentication.getName(), id, request));
    }

    @DeleteMapping("/meals/{id}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Long id, Authentication authentication) {
        dietLibraryService.deleteMeal(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // ---------- Kategoriler ----------

    @PostMapping("/categories")
    public ResponseEntity<QuickPickCategoryResponse> createCategory(
            @Valid @RequestBody QuickPickCategoryRequest request,
            Authentication authentication
    ) {
        QuickPickCategoryResponse category = dietLibraryService.createCategory(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<QuickPickCategoryResponse> renameCategory(
            @PathVariable Long id,
            @Valid @RequestBody QuickPickCategoryRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(dietLibraryService.renameCategory(authentication.getName(), id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id, Authentication authentication) {
        dietLibraryService.deleteCategory(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // ---------- Maddeler ----------

    @PostMapping("/categories/{id}/items")
    public ResponseEntity<QuickPickItemResponse> addItem(
            @PathVariable Long id,
            @Valid @RequestBody QuickPickItemRequest request,
            Authentication authentication
    ) {
        QuickPickItemResponse item = dietLibraryService.addItem(authentication.getName(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<QuickPickItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody QuickPickItemRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(dietLibraryService.updateItem(authentication.getName(), id, request));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, Authentication authentication) {
        dietLibraryService.deleteItem(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
