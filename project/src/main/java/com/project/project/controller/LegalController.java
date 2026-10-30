package com.project.project.controller;

import com.project.project.dto.LegalTextResponse;
import com.project.project.legal.LegalTexts;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// KVKK metinleri (herkese açık): gizlilik sayfası ve onay ekranı bunları gösterir
@RestController
@RequestMapping("/legal")
public class LegalController {

    @GetMapping("/privacy")
    public ResponseEntity<LegalTextResponse> privacy() {
        return ResponseEntity.ok(new LegalTextResponse(LegalTexts.PRIVACY_VERSION, LegalTexts.PRIVACY_TEXT));
    }

    @GetMapping("/consent")
    public ResponseEntity<LegalTextResponse> consent() {
        return ResponseEntity.ok(new LegalTextResponse(LegalTexts.CONSENT_VERSION, LegalTexts.CONSENT_TEXT));
    }
}
