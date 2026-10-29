package com.project.project.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

// Şifre kuralı: en az 8, en fazla 72 karakter (BCrypt 72 bayttan sonrasını yok sayar)
class RegisterRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private RegisterRequest request(String password) {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("ayse");
        request.setEmail("ayse@test.com");
        request.setPassword(password);
        request.setInviteToken("tok");
        return request;
    }

    @Test
    void shortPasswordIsRejected() {
        assertFalse(validator.validate(request("1234567")).isEmpty());
    }

    @Test
    void eightCharacterPasswordIsAccepted() {
        assertTrue(validator.validate(request("12345678")).isEmpty());
    }

    @Test
    void tooLongPasswordIsRejected() {
        assertFalse(validator.validate(request("a".repeat(73))).isEmpty());
    }

    @Test
    void tooLongUsernameIsRejected() {
        RegisterRequest request = request("12345678");
        request.setUsername("a".repeat(51));

        assertFalse(validator.validate(request).isEmpty());
    }
}
