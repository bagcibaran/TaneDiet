package com.project.project.dto;

import java.util.List;

// Diyetisyen son baktığından beri danışanın sayfasında neler yeni? (sayfada işaretlemek için)
public class ClientActivityResponse {

    private final List<Long> newWeightEntryIds;
    private final String intakeStatus;
    private final List<String> changedFields;

    public ClientActivityResponse(List<Long> newWeightEntryIds, String intakeStatus, List<String> changedFields) {
        this.newWeightEntryIds = newWeightEntryIds;
        this.intakeStatus = intakeStatus;
        this.changedFields = changedFields;
    }

    public List<Long> getNewWeightEntryIds() {
        return newWeightEntryIds;
    }

    public String getIntakeStatus() {
        return intakeStatus;
    }

    public List<String> getChangedFields() {
        return changedFields;
    }
}
