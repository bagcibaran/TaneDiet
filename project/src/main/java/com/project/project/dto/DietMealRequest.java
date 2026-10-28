package com.project.project.dto;

import jakarta.validation.constraints.*;

// Programdaki bir öğün (düzenleme ekranından gelir)
public class DietMealRequest {

    // 0 = her gün (günlük program), 1-7 = Pazartesi-Pazar (haftalık program)
    @NotNull(message = "Öğünün günü belirtilmeli")
    @Min(value = 0, message = "Geçersiz gün")
    @Max(value = 7, message = "Geçersiz gün")
    private Integer dayIndex;

    @NotBlank(message = "Öğün adı boş olamaz")
    @Size(max = 60, message = "Öğün adı en fazla 60 karakter olabilir")
    private String name;

    // "10:30" biçiminde ya da boş
    @Pattern(regexp = "^\\s*$|^([01]\\d|2[0-3]):[0-5]\\d$", message = "Öğün saati SS:DD biçiminde olmalı")
    private String time;

    @NotBlank(message = "Öğünde en az bir madde olmalı")
    @Size(max = 4000, message = "Bir öğün en fazla 4000 karakter olabilir")
    private String items;

    public Integer getDayIndex() {
        return dayIndex;
    }

    public void setDayIndex(Integer dayIndex) {
        this.dayIndex = dayIndex;
    }

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
