package com.project.project.dto;

import com.project.project.entity.DietPlan.PlanType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

// Diyetisyenin yazdığı program (oluşturma ve düzenleme aynı şekli kullanır; öğünlerin tamamı gönderilir)
public class DietPlanRequest {

    @NotNull(message = "Program türü seçilmeli")
    private PlanType planType;

    @NotBlank(message = "Program başlığı boş olamaz")
    @Size(max = 100, message = "Başlık en fazla 100 karakter olabilir")
    private String title;

    @NotNull(message = "Başlangıç tarihi boş olamaz")
    private LocalDate startDate;

    @Size(max = 4000, message = "Not en fazla 4000 karakter olabilir")
    private String notes;

    @NotEmpty(message = "Programda en az bir öğün olmalı")
    @Size(max = 100, message = "Bir programda en fazla 100 öğün olabilir")
    private List<@Valid DietMealRequest> meals;

    public PlanType getPlanType() {
        return planType;
    }

    public void setPlanType(PlanType planType) {
        this.planType = planType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<DietMealRequest> getMeals() {
        return meals;
    }

    public void setMeals(List<DietMealRequest> meals) {
        this.meals = meals;
    }
}
