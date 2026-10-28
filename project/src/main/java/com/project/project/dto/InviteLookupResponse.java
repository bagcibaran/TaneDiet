package com.project.project.dto;

// Kayıt sayfasının davet linkini kontrol etmesi: yalnızca paket süresi (başka bilgi verilmez)
public class InviteLookupResponse {

    private final int months;

    public InviteLookupResponse(int months) {
        this.months = months;
    }

    public int getMonths() {
        return months;
    }
}
