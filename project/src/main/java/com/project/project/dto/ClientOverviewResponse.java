package com.project.project.dto;

import com.project.project.entity.User;

import java.time.LocalDate;

// Diyetisyenin danışan listesindeki bir kart: kimlik + bildirimler
public class ClientOverviewResponse {

    private final Long id;
    private final String username;
    private final String email;
    // Diyetisyen son baktığından beri danışanın kendi girdiği kilo kaydı sayısı
    private final long newWeightCount;
    // MISSING: form yok · NEW: form yeni dolduruldu · UPDATED: bazı sorular değişti · SEEN: yeni bir şey yok
    private final String intakeStatus;
    // Danışana yazılmış bir diyet programı var mı? (kartta ✓)
    private final boolean hasPlan;
    // Hizmet süresi: son gün (null = süresiz), kilitli mi, kaç gün kaldı (kartta rozet)
    private final LocalDate accessUntil;
    private final boolean locked;
    private final Integer daysLeft;

    public ClientOverviewResponse(User client, long newWeightCount, String intakeStatus, boolean hasPlan, ClientAccessResponse access) {
        this.id = client.getId();
        this.username = client.getUsername();
        this.email = client.getEmail();
        this.newWeightCount = newWeightCount;
        this.intakeStatus = intakeStatus;
        this.hasPlan = hasPlan;
        this.accessUntil = access.getAccessUntil();
        this.locked = access.isLocked();
        this.daysLeft = access.getDaysLeft();
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

    public boolean isHasPlan() {
        return hasPlan;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public long getNewWeightCount() {
        return newWeightCount;
    }

    public String getIntakeStatus() {
        return intakeStatus;
    }
}
