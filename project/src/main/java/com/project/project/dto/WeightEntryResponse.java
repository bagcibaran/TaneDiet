package com.project.project.dto;

import com.project.project.entity.WeightEntry;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class WeightEntryResponse {

    private Long id;
    private BigDecimal weightKg;
    private LocalDate measuredOn;
    private String enteredBy;
    private LocalDateTime createdAt;

    public WeightEntryResponse(WeightEntry entry) {
        this.id = entry.getId();
        this.weightKg = entry.getWeightKg();
        this.measuredOn = entry.getMeasuredOn();
        this.enteredBy = entry.getEnteredBy().getUsername();
        this.createdAt = entry.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public LocalDate getMeasuredOn() {
        return measuredOn;
    }

    public String getEnteredBy() {
        return enteredBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}