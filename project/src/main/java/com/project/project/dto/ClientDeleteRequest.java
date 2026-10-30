package com.project.project.dto;

import jakarta.validation.constraints.NotBlank;

// Danışanı kalıcı silme onayı: diyetisyen danışanın kullanıcı adını aynen yazar
public class ClientDeleteRequest {

    @NotBlank(message = "Onay için danışanın kullanıcı adını yaz")
    private String confirmUsername;

    public String getConfirmUsername() {
        return confirmUsername;
    }

    public void setConfirmUsername(String confirmUsername) {
        this.confirmUsername = confirmUsername;
    }
}
