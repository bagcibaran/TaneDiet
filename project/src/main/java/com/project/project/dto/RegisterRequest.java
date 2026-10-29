package com.project.project.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Herkese açık kayıt: yalnızca diyetisyenin gönderdiği davet linkiyle (inviteToken)
public class RegisterRequest {

    @NotBlank(message = "Kullanıcı adı boş olamaz")
    @Size(max = 50, message = "Kullanıcı adı en fazla 50 karakter olabilir")
    private String username;

    @NotBlank(message = "E-posta boş olamaz")
    @Email(message = "Geçerli bir e-posta adresi girin")
    @Size(max = 100, message = "E-posta en fazla 100 karakter olabilir")
    private String email;

    // BCrypt 72 bayttan sonrasını yok sayar
    @NotBlank(message = "Şifre boş olamaz")
    @Size(min = 8, max = 72, message = "Şifre en az 8, en fazla 72 karakter olmalı")
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
