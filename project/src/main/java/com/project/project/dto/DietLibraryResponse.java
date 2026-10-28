package com.project.project.dto;

import java.util.List;

// Diyetisyenin hazır öğünleri ve hızlı madde kategorileri (tek istekte)
public class DietLibraryResponse {

    private final List<MealTemplateResponse> meals;
    private final List<QuickPickCategoryResponse> categories;

    public DietLibraryResponse(List<MealTemplateResponse> meals, List<QuickPickCategoryResponse> categories) {
        this.meals = meals;
        this.categories = categories;
    }

    public List<MealTemplateResponse> getMeals() {
        return meals;
    }

    public List<QuickPickCategoryResponse> getCategories() {
        return categories;
    }
}
