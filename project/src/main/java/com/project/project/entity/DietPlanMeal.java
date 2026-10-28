package com.project.project.entity;

import jakarta.persistence.*;

// Diyet programındaki bir öğün: adı, saati ve maddeleri (her satır bir madde, seçenekler " / " ile)
@Entity
@Table(name = "diet_plan_meal")
public class DietPlanMeal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private DietPlan plan;

    // 0 = her gün (günlük program), 1-7 = Pazartesi-Pazar (haftalık program)
    @Column(nullable = false)
    private int dayIndex;

    // O gün içindeki sıra
    @Column(nullable = false)
    private int position;

    @Column(nullable = false, length = 60)
    private String name;

    // "10:30" gibi; boş olabilir
    @Column(length = 5)
    private String mealTime;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String items;

    public DietPlanMeal() {
    }

    public DietPlanMeal(DietPlan plan, int dayIndex, int position, String name, String mealTime, String items) {
        this.plan = plan;
        this.dayIndex = dayIndex;
        this.position = position;
        this.name = name;
        this.mealTime = mealTime;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public DietPlan getPlan() {
        return plan;
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

    public String getMealTime() {
        return mealTime;
    }

    public String getItems() {
        return items;
    }
}
