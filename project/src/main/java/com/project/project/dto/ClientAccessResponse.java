package com.project.project.dto;

import java.time.LocalDate;

// Danışanın hizmet süresi: son gün (null = süresiz), kilitli mi, kaç gün kaldı (süresiz veya kilitliyse null)
public class ClientAccessResponse {

    private final LocalDate accessUntil;
    private final boolean locked;
    private final Integer daysLeft;

    public ClientAccessResponse(LocalDate accessUntil, boolean locked, Integer daysLeft) {
        this.accessUntil = accessUntil;
        this.locked = locked;
        this.daysLeft = daysLeft;
    }

    public LocalDate getAccessUntil() {
        return accessUntil;
    }

    public boolean isLocked() {
        return locked;
    }

    public Integer getDaysLeft() {
        return daysLeft;
    }
}
