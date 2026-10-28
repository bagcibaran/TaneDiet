package com.project.project.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Diyetisyenin bir danışana yazdığı diyet programı. Danışanın en son programı aktif olandır.
@Entity
@Table(name = "diet_plan")
public class DietPlan {

    public enum PlanType { DAILY, WEEKLY }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanType planType;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Öğünler programla birlikte kaydedilir ve silinir; listeden çıkarılan öğün veritabanından da silinir
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayIndex ASC, position ASC")
    private List<DietPlanMeal> meals = new ArrayList<>();

    public DietPlan() {
    }

    public DietPlan(User client, User createdBy) {
        this.client = client;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }

    // Programın bütün öğünlerini yenileriyle değiştirir (düzenleme ekranı her seferinde tamamını gönderir)
    public void replaceMeals(List<DietPlanMeal> newMeals) {
        meals.clear();
        meals.addAll(newMeals);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getClient() {
        return client;
    }

    public User getCreatedBy() {
        return createdBy;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<DietPlanMeal> getMeals() {
        return meals;
    }
}
