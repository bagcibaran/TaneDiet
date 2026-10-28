package com.project.project.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Herkese açık kayıt: yalnızca diyetisyenin gönderdiği davet linkiyle (inviteToken)
public class RegisterRequest {

    @NotBlank(message = "Username alanı boş olamaz!!!")
    private String username;

    @NotBlank(message = "Email alanı boş olamaz!!!")
    @Email(message = "Email alanı formata uygun olmalı!!")
    private String email;

    @NotBlank(message = "Password alanı boş olamaz!!!")
    private String password;

    @NotBlank(message = "Kayıt yalnızca davet linkiyle yapılabilir")
    private String inviteToken;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getInviteToken() {
        return inviteToken;
    }

    public void setInviteToken(String inviteToken) {
        this.inviteToken = inviteToken;
    }
}
