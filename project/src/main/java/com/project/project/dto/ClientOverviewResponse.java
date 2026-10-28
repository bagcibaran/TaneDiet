package com.project.project.dto;

import com.project.project.entity.User;

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

    public ClientOverviewResponse(User client, long newWeightCount, String intakeStatus, boolean hasPlan) {
        this.id = client.getId();
        this.username = client.getUsername();
        this.email = client.getEmail();
        this.newWeightCount = newWeightCount;
        this.intakeStatus = intakeStatus;
        this.hasPlan = hasPlan;
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
