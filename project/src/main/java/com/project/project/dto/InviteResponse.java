package com.project.project.dto;

import com.project.project.entity.Invite;

import java.time.LocalDateTime;

// Diyetisyene gösterilen davet (link token'dan kurulur)
public class InviteResponse {

    private final Long id;
    private final String token;
    private final String note;
    private final int months;
    private final LocalDateTime createdAt;
    private final LocalDateTime expiresAt;

    public InviteResponse(Invite invite) {
        this.id = invite.getId();
        this.token = invite.getToken();
        this.note = invite.getNote();
        this.months = invite.getMonths();
        this.createdAt = invite.getCreatedAt();
        this.expiresAt = invite.getExpiresAt();
    }

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public String getNote() {
        return note;
    }

    public int getMonths() {
        return months;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}
