package com.project.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Hazır öğün ekleme / düzenleme
public class MealTemplateRequest {

    @NotBlank(message = "Öğün adı boş olamaz")
    @Size(max = 60, message = "Öğün adı en fazla 60 karakter olabilir")
    private String name;

    // "10:30" biçiminde ya da boş
    @Pattern(regexp = "^\\s*$|^([01]\\d|2[0-3]):[0-5]\\d$", message = "Öğün saati SS:DD biçiminde olmalı")
    private String time;

    // Boş olabilir (o zaman öğün yalnızca adı ve saatiyle eklenir)
    @Size(max = 4000, message = "Bir öğün en fazla 4000 karakter olabilir")
    private String items;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getItems() {
        return items;
    }

    public void setItems(String items) {
        this.items = items;
    }
}
