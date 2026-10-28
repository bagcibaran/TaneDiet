package com.project.project.exception;

// Diyet programı kurallara uymuyorsa (ör. günlük programda haftanın günü) fırlatılır → 400
public class DietPlanInvalidException extends RuntimeException {

    public DietPlanInvalidException(String message) {
        super(message);
    }

    // Program yoksa veya bu danışana ait değilse → 404
    public static class NotFound extends RuntimeException {
        public NotFound(String message) {
            super(message);
        }
    }
}
