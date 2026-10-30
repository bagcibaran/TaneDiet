package com.project.project.controller;

import com.project.project.dto.LegalTextResponse;
import com.project.project.legal.LegalTexts;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// KVKK metinleri (herkese açık): gizlilik sayfası ve onay ekranı bunları gösterir.
// ?lang=en ile İngilizce çeviri (bilgi amaçlı); çevirisi olmayan dilde Türkçe. Sürüm her dilde aynıdır.
@RestController
@RequestMapping("/legal")
public class LegalController {

    @GetMapping("/privacy")
    public ResponseEntity<LegalTextResponse> privacy(@RequestParam(defaultValue = "tr") String lang) {
        boolean english = LegalTexts.hasTranslation(lang);
        return ResponseEntity.ok(new LegalTextResponse(
                LegalTexts.PRIVACY_VERSION,
                english ? LegalTexts.PRIVACY_TEXT_EN : LegalTexts.PRIVACY_TEXT,
                english ? lang : "tr"
        ));
    }

    @GetMapping("/consent")
    public ResponseEntity<LegalTextResponse> consent(@RequestParam(defaultValue = "tr") String lang) {
        boolean english = LegalTexts.hasTranslation(lang);
        return ResponseEntity.ok(new LegalTextResponse(
                LegalTexts.CONSENT_VERSION,
                english ? LegalTexts.CONSENT_TEXT_EN : LegalTexts.CONSENT_TEXT,
                english ? lang : "tr"
        ));
    }
}
