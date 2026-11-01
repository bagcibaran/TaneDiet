package com.project.project.dto;

import com.project.project.entity.IntakeForm;
import com.project.project.entity.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class IntakeFormResponseTest {

    // Yaş, verilen "bugün"e göre hesaplanır (sunucunun saatine göre değil): doğum gününden bir gün önce 35
    @Test
    void ageUsesGivenDate() {
        IntakeForm form = new IntakeForm(new User("ayse", "ayse@test.com", "hash"));
        form.setBirthDate(LocalDate.of(1990, 10, 31));

        IntakeFormResponse response = new IntakeFormResponse(form, LocalDate.of(2026, 10, 30));

        assertEquals(35, response.getAge());
    }
}
