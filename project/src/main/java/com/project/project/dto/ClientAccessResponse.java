package com.project.project.dto;

import java.time.LocalDate;

// Danışanın hizmet süresi: son gün (null = süresiz), kilitli mi, kaç gün kaldı (süresiz veya kilitliyse null),
// verilerin otomatik silineceği gün (KVKK: son günden 2 yıl sonraki günün ertesi gecesi; süresizse null)
public class ClientAccessResponse {

    private final LocalDate accessUntil;
    private final boolean locked;
    private final Integer daysLeft;
    private final LocalDate deletionDate;

    public ClientAccessResponse(LocalDate accessUntil, boolean locked, Integer daysLeft, LocalDate deletionDate) {
        this.accessUntil = accessUntil;
        this.locked = locked;
        this.daysLeft = daysLeft;
        this.deletionDate = deletionDate;
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

    public LocalDate getDeletionDate() {
        return deletionDate;
    }
}
