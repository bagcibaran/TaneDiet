package com.project.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Diyetisyenin kaydettiği hazır öğün: adı, saati ve maddeleri (programdaki öğünle aynı biçim)
@Entity
@Table(name = "meal_template")
public class MealTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 60)
    private String name;

    // "10:30" gibi; boş olabilir
    @Column(length = 5)
    private String mealTime;

    // Her satır bir madde; boş olabilir (o zaman yalnızca öğün adı ve saati eklenir)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String items;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public MealTemplate() {
    }

    public MealTemplate(User owner, String name, String mealTime, String items) {
        this.owner = owner;
        this.name = name;
        this.mealTime = mealTime;
        this.items = items;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getOwner() {
        return owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMealTime() {
        return mealTime;
    }

    public void setMealTime(String mealTime) {
        this.mealTime = mealTime;
    }

    public String getItems() {
        return items;
    }

    public void setItems(String items) {
        this.items = items;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
