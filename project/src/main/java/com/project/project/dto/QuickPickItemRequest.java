package com.project.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Hızlı madde ekleme / düzenleme
public class QuickPickItemRequest {

    @NotBlank(message = "Madde boş olamaz")
    @Size(max = 255, message = "Madde en fazla 255 karakter olabilir")
    private String text;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
