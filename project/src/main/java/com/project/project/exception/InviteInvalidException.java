package com.project.project.exception;

// Davet linki yok, kullanılmış veya süresi dolmuşsa fırlatılır (bakışta 404, kayıtta 400)
public class InviteInvalidException extends RuntimeException {

    public static final String MESSAGE = "Davet linki geçersiz veya süresi dolmuş";

    public InviteInvalidException() {
        super(MESSAGE);
    }
}
