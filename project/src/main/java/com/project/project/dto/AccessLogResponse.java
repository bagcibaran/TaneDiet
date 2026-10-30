package com.project.project.dto;

import com.project.project.entity.AccessLog;

import java.time.LocalDateTime;

// Erişim kaydı: kim, ne yaptı (VIEW_INTAKE / EXPORT), ne zaman
public class AccessLogResponse {

    private final String action;
    private final String viewer;
    private final LocalDateTime createdAt;

    public AccessLogResponse(AccessLog log) {
        this.action = log.getAction().name();
        this.viewer = log.getViewer().getUsername();
        this.createdAt = log.getCreatedAt();
    }

    public String getAction() {
        return action;
    }

    public String getViewer() {
        return viewer;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
