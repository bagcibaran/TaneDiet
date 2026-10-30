package com.project.project.dto;

// Aydınlatma metni ya da açık rıza metni ve sürümü (herkese açık).
// language: metnin gerçek dili ("tr" ya da çeviri, ör. "en"); çeviri yoksa Türkçe döner.
public class LegalTextResponse {

    private final String version;
    private final String text;
    private final String language;

    public LegalTextResponse(String version, String text, String language) {
        this.version = version;
        this.text = text;
        this.language = language;
    }

    public String getVersion() {
        return version;
    }

    public String getText() {
        return text;
    }

    public String getLanguage() {
        return language;
    }
}
