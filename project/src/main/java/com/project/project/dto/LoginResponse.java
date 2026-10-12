package com.project.project.dto;

public class LoginResponse {
    private String token;

    private String message;

    public LoginResponse(String token, String message) {
        this.token = token;
        this.message = message;
    }

    @Override
    public String toString() {
        return "TaskEntity{token=" + token + ", message='" + message + "}";
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
}