package com.project.project.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;

public class WeightEntryCreateRequest {

    @NotNull(message = "Kilo boş olamaz")
    @DecimalMin(value = "20.0", message = "Kilo en az 20 kg olmalı")
    @DecimalMax(value = "400.0", message = "Kilo en fazla 400 kg olabilir")
    @Digits(integer = 3, fraction = 2, message = "Kilo en fazla 2 ondalık basamak içerebilir")
    private BigDecimal weightKg;

    @NotNull(message = "Tartı tarihi boş olamaz")
    @PastOrPresent(message = "Tartı tarihi gelecekte olamaz")
    private LocalDate measuredOn;

    public WeightEntryCreateRequest() {
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
    }

    public LocalDate getMeasuredOn() {
        return measuredOn;
    }

    public void setMeasuredOn(LocalDate measuredOn) {
        this.measuredOn = measuredOn;
    }
}