package com.project.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Kategori ekleme / yeniden adlandırma
public class QuickPickCategoryRequest {

    @NotBlank(message = "Kategori adı boş olamaz")
    @Size(max = 50, message = "Kategori adı en fazla 50 karakter olabilir")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
