package com.project.project.dto;

import com.project.project.entity.DietPlan;
import com.project.project.entity.DietPlanMeal;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Diyet programı (danışan ve diyetisyen aynı şekli görür)
public class DietPlanResponse {

    private final Long id;
    private final String planType;
    private final String title;
    private final LocalDate startDate;
    private final String notes;
    private final String createdBy;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final List<Meal> meals;

    public DietPlanResponse(DietPlan plan) {
        this.id = plan.getId();
        this.planType = plan.getPlanType().name();
        this.title = plan.getTitle();
        this.startDate = plan.getStartDate();
        this.notes = plan.getNotes();
        this.createdBy = plan.getCreatedBy().getUsername();
        this.createdAt = plan.getCreatedAt();
        this.updatedAt = plan.getUpdatedAt();
        this.meals = plan.getMeals().stream().map(Meal::new).toList();
    }

    public Long getId() {
        return id;
    }

    public String getPlanType() {
        return planType;
    }

    public String getTitle() {
        return title;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public String getNotes() {
        return notes;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<Meal> getMeals() {
        return meals;
    }

    // Programdaki bir öğün
    public static class Meal {

        private final int dayIndex;
        private final int position;
        private final String name;
        private final String time;
        private final String items;

        public Meal(DietPlanMeal meal) {
            this.dayIndex = meal.getDayIndex();
            this.position = meal.getPosition();
            this.name = meal.getName();
            this.time = meal.getMealTime();
            this.items = meal.getItems();
        }

        public int getDayIndex() {
            return dayIndex;
        }

        public int getPosition() {
            return position;
        }

        public String getName() {
            return name;
        }

        public String getTime() {
            return time;
        }

        public String getItems() {
            return items;
        }
    }
}
