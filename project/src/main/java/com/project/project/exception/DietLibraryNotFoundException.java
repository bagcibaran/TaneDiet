package com.project.project.exception;

// Hazır öğün, kategori veya madde yoksa ya da başka diyetisyene aitse fırlatılır → 404
public class DietLibraryNotFoundException extends RuntimeException {

    public DietLibraryNotFoundException(String message) {
        super(message);
    }
}
