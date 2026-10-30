package com.project.project.dto;

import com.project.project.entity.ConsentRecord;

import java.time.LocalDateTime;

public class ConsentRecordResponse {

    private final String version;
    private final LocalDateTime acceptedAt;

    public ConsentRecordResponse(ConsentRecord record) {
        this.version = record.getVersion();
        this.acceptedAt = record.getAcceptedAt();
    }

    public String getVersion() {
        return version;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }
}
