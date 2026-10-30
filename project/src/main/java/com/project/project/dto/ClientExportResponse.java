package com.project.project.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// KVKK: danışan hakkında tutulan her şey tek belgede (danışan isterse WhatsApp'tan ona iletilir)
public class ClientExportResponse {

    private final UserResponse client;
    private final LocalDate accessUntil;
    private final IntakeFormResponse intake;
    private final List<ConsentRecordResponse> consents;
    private final List<WeightEntryResponse> weights;
    private final List<DietPlanResponse> plans;
    private final List<AccessLogResponse> accessLog;
    private final LocalDateTime exportedAt;

    public ClientExportResponse(
            UserResponse client,
            LocalDate accessUntil,
            IntakeFormResponse intake,
            List<ConsentRecordResponse> consents,
            List<WeightEntryResponse> weights,
            List<DietPlanResponse> plans,
            List<AccessLogResponse> accessLog,
            LocalDateTime exportedAt
    ) {
        this.client = client;
        this.accessUntil = accessUntil;
        this.intake = intake;
        this.consents = consents;
        this.weights = weights;
        this.plans = plans;
        this.accessLog = accessLog;
        this.exportedAt = exportedAt;
    }

    public UserResponse getClient() {
        return client;
    }

    public LocalDate getAccessUntil() {
        return accessUntil;
    }

    public IntakeFormResponse getIntake() {
        return intake;
    }

    public List<ConsentRecordResponse> getConsents() {
        return consents;
    }

    public List<WeightEntryResponse> getWeights() {
        return weights;
    }

    public List<DietPlanResponse> getPlans() {
        return plans;
    }

    public List<AccessLogResponse> getAccessLog() {
        return accessLog;
    }

    public LocalDateTime getExportedAt() {
        return exportedAt;
    }
}
