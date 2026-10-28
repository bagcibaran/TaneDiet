package com.project.project.exception;

// Hizmet süresi dolan danışan giriş yapmaya veya API'yi kullanmaya çalışınca → 423 (Locked)
public class ClientAccessLockedException extends RuntimeException {

    public static final String MESSAGE = "Hizmet süren doldu. Devam etmek için diyetisyeninle iletişime geç.";

    public ClientAccessLockedException() {
        super(MESSAGE);
    }
}
