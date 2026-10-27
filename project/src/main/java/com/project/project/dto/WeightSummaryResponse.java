package com.project.project.dto;

import java.math.BigDecimal;
import java.util.List;

// Kartlar ve grafik için tek cevap. Hesaplanamayan değerler null döner.
public class WeightSummaryResponse {

    private final BigDecimal startWeightKg;
    private final BigDecimal latestWeightKg;
    private final BigDecimal changeSinceStartKg;
    private final BigDecimal changeLast7DaysKg;
    private final BigDecimal changeLast30DaysKg;
    private final List<WeightPointResponse> points;

    public WeightSummaryResponse(
            BigDecimal startWeightKg,
            BigDecimal latestWeightKg,
            BigDecimal changeSinceStartKg,
            BigDecimal changeLast7DaysKg,
            BigDecimal changeLast30DaysKg,
            List<WeightPointResponse> points
    ) {
        this.startWeightKg = startWeightKg;
        this.latestWeightKg = latestWeightKg;
        this.changeSinceStartKg = changeSinceStartKg;
        this.changeLast7DaysKg = changeLast7DaysKg;
        this.changeLast30DaysKg = changeLast30DaysKg;
        this.points = points;
    }

    public BigDecimal getStartWeightKg() {
        return startWeightKg;
    }

    public BigDecimal getLatestWeightKg() {
        return latestWeightKg;
    }

    public BigDecimal getChangeSinceStartKg() {
        return changeSinceStartKg;
    }

    public BigDecimal getChangeLast7DaysKg() {
        return changeLast7DaysKg;
    }

    public BigDecimal getChangeLast30DaysKg() {
        return changeLast30DaysKg;
    }

    public List<WeightPointResponse> getPoints() {
        return points;
    }
}