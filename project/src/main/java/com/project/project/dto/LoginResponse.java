package com.project.project.dto;

import com.project.project.entity.Role;

public class LoginResponse {
    private String token;
    private String message;
    private Role role;

    public LoginResponse(String token, String message, Role role) {
        this.token = token;
        this.message = message;
        this.role = role;
    }

    @Override
    public String toString() {
        return "LoginResponse{message='" + message + "', role=" + role + "}";
    }

    public String getToken() {
        return token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Role getRole() {
        return role;
    }
}