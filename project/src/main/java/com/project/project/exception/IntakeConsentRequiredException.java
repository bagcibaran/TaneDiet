package com.project.project.exception;

// Ön görüşme formu ilk kez gönderilirken açık rıza verilmediyse fırlatılır (400)
public class IntakeConsentRequiredException extends RuntimeException {
    public IntakeConsentRequiredException(String message) {
        super(message);
    }
}
