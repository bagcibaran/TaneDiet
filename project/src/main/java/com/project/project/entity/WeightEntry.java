package com.project.project.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "weight_entry")
public class WeightEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(nullable = false)
    private LocalDate measuredOn;

    @ManyToOne
    @JoinColumn(name = "entered_by_id", nullable = false)
    private User enteredBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public WeightEntry() {
    }

    public WeightEntry(User user, BigDecimal weightKg, LocalDate measuredOn, User enteredBy) {
        this.user = user;
        this.weightKg = weightKg;
        this.measuredOn = measuredOn;
        this.enteredBy = enteredBy;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public LocalDate getMeasuredOn() {
        return measuredOn;
    }

    public User getEnteredBy() {
        return enteredBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}