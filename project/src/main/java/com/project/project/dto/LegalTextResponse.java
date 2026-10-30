package com.project.project.dto;

// Aydınlatma metni ya da açık rıza metni ve sürümü (herkese açık)
public class LegalTextResponse {

    private final String version;
    private final String text;

    public LegalTextResponse(String version, String text) {
        this.version = version;
        this.text = text;
    }

    public String getVersion() {
        return version;
    }

    public String getText() {
        return text;
    }
}
