package com.project.project.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

// Grafikteki bir nokta: bir gün ve o günün kilosu
public class WeightPointResponse {

    private final LocalDate date;
    private final BigDecimal weightKg;

    public WeightPointResponse(LocalDate date, BigDecimal weightKg) {
        this.date = date;
        this.weightKg = weightKg;
    }

    public LocalDate getDate() {
        return date;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }
}