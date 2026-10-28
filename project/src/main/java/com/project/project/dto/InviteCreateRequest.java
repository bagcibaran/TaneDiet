package com.project.project.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Diyetisyenin yeni davet linki isteği: paket süresi ve isteğe bağlı "kimin için" notu
public class InviteCreateRequest {

    @NotNull(message = "Paket süresi seçilmeli")
    private Integer months;

    @Size(max = 60, message = "Not en fazla 60 karakter olabilir")
    private String note;

    public Integer getMonths() {
        return months;
    }

    public void setMonths(Integer months) {
        this.months = months;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
