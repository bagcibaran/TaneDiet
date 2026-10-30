package com.project.project.exception;

// Danışan eski bir rıza metnini onaylamaya çalıştı (sayfa açıkken metin güncellendi) → 409
public class ConsentVersionException extends RuntimeException {

    public ConsentVersionException(String message) {
        super(message);
    }
}
