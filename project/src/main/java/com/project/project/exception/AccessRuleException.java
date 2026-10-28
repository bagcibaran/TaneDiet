package com.project.project.exception;

// Hizmet süresi veya davet isteği kurallara uymuyorsa (ör. paket süresi 2 ay) fırlatılır → 400
public class AccessRuleException extends RuntimeException {

    public AccessRuleException(String message) {
        super(message);
    }
}
