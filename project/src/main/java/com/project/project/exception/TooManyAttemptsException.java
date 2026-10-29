package com.project.project.exception;

// Çok fazla giriş denemesi ya da çok fazla istek (şifre deneme saldırısına karşı) → 429
public class TooManyAttemptsException extends RuntimeException {

    public static final String MESSAGE = "Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar dene.";

    public TooManyAttemptsException() {
        super(MESSAGE);
    }
}
