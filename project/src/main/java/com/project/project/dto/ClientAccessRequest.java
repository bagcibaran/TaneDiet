package com.project.project.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

// Diyetisyenin danışanın hizmet süresinde yaptığı işlem
public class ClientAccessRequest {

    // ADD_MONTHS: paket ekle (months) · SET_DATE: bitiş tarihini ayarla (date)
    // UNLIMITED: süresiz yap · CLOSE_NOW: erişimi hemen kapat
    public enum Action { ADD_MONTHS, SET_DATE, UNLIMITED, CLOSE_NOW }

    @NotNull(message = "İşlem seçilmeli")
    private Action action;

    private Integer months;

    private LocalDate date;

    public Action getAction() {
        return action;
    }

    public void setAction(Action action) {
        this.action = action;
    }

    public Integer getMonths() {
        return months;
    }

    public void setMonths(Integer months) {
        this.months = months;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
