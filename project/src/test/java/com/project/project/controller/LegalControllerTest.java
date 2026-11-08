package com.project.project.controller;

import com.project.project.dto.LegalTextResponse;
import com.project.project.legal.LegalTexts;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LegalControllerTest {

    private final LegalController controller = new LegalController();

    @Test
    void privacyIsTurkishByDefault() {
        LegalTextResponse response = controller.privacy("tr").getBody();

        assertEquals(LegalTexts.PRIVACY_TEXT, response.getText());
        assertEquals("tr", response.getLanguage());
    }

    @Test
    void privacyInEnglishWhenAsked() {
        LegalTextResponse response = controller.privacy("en").getBody();

        assertEquals(LegalTexts.PRIVACY_TEXT_EN, response.getText());
        assertEquals("en", response.getLanguage());
    }

    // Çevirisi olmayan dil: Türkçe metin döner, dil "tr" olarak bildirilir
    @Test
    void unknownLanguageFallsBackToTurkish() {
        LegalTextResponse response = controller.consent("fr").getBody();

        assertEquals(LegalTexts.CONSENT_TEXT, response.getText());
        assertEquals("tr", response.getLanguage());
    }

    @Test
    void privacyInGermanWhenAsked() {
        LegalTextResponse response = controller.privacy("de").getBody();

        assertEquals(LegalTexts.PRIVACY_TEXT_DE, response.getText());
        assertEquals("de", response.getLanguage());
    }

    @Test
    void consentVersionIsSameInGerman() {
        LegalTextResponse german = controller.consent("de").getBody();

        assertEquals(LegalTexts.CONSENT_VERSION, german.getVersion());
        assertEquals(LegalTexts.CONSENT_TEXT_DE, german.getText());
        assertEquals("de", german.getLanguage());
    }

    // Onaylanan sürüm dilden bağımsız: bağlayıcı olan Türkçe metindir
    @Test
    void consentVersionIsSameInEveryLanguage() {
        LegalTextResponse english = controller.consent("en").getBody();

        assertEquals(LegalTexts.CONSENT_VERSION, english.getVersion());
        assertEquals(LegalTexts.CONSENT_TEXT_EN, english.getText());
    }
}
