package com.project.project.service.impl;

import com.project.project.dto.ConsentRecordResponse;
import com.project.project.entity.ConsentRecord;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.ConsentVersionException;
import com.project.project.exception.UserNotFoundException;
import com.project.project.legal.LegalTexts;
import com.project.project.repository.ConsentRecordRepository;
import com.project.project.repository.IntakeFormRepository;
import com.project.project.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

// KVKK açık rızası: danışanın hangi metin sürümünü onayladığı kaydedilir.
// Metin değişince, formu olan danışan güncel metni onaylayana kadar sağlık verilerine ulaşamaz (filtre 428 verir).
@Service
public class ConsentService {

    private static final String CURRENT_HASH = sha256(LegalTexts.CONSENT_TEXT);

    private final ConsentRecordRepository consentRecordRepository;
    private final IntakeFormRepository intakeFormRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    public ConsentService(
            ConsentRecordRepository consentRecordRepository,
            IntakeFormRepository intakeFormRepository,
            UserRepository userRepository,
            Clock clock
    ) {
        this.consentRecordRepository = consentRecordRepository;
        this.intakeFormRepository = intakeFormRepository;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    // Güncel rıza metninin özeti (SHA-256, onaltılık)
    public static String currentHash() {
        return CURRENT_HASH;
    }

    // Formu olan danışan, en son onayladığı sürüm ya da metin güncel değilse (ya da hiç kaydı yoksa) yeniden onaylamalı.
    // Metin özeti de karşılaştırılır: metin değişip sürüm unutulsa bile danışan yeni metni görür.
    // Formu olmayan yeni danışan ilk onayını formdaki kutuyla verir.
    public boolean needsConsent(User user) {
        if (user.getRole() != Role.CLIENT || !intakeFormRepository.existsByUser(user)) {
            return false;
        }
        return consentRecordRepository.findFirstByUserOrderByAcceptedAtDesc(user)
                .map(record -> !LegalTexts.CONSENT_VERSION.equals(record.getVersion()) || !CURRENT_HASH.equals(record.getTextHash()))
                .orElse(true);
    }

    // Güncel sürümü kaydeder (ilk form gönderiminde ve onay ekranında)
    public void recordCurrent(User user) {
        consentRecordRepository.save(new ConsentRecord(user, LegalTexts.CONSENT_VERSION, CURRENT_HASH, LocalDateTime.now(clock)));
    }

    // Onay ekranı: danışan gördüğü sürümü gönderir; eskiyse (sayfa açıkken metin değişti) kaydedilmez
    @Transactional
    public void accept(String username, String version) {
        if (!LegalTexts.CONSENT_VERSION.equals(version)) {
            throw new ConsentVersionException("Metin güncellendi, sayfayı yenileyip tekrar onayla");
        }
        recordCurrent(findUserByUsername(username));
    }

    public List<ConsentRecordResponse> history(User user) {
        return consentRecordRepository.findAllByUserOrderByAcceptedAtDesc(user).stream()
                .map(ConsentRecordResponse::new)
                .toList();
    }

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı: " + username));
    }

    private static String sha256(String text) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 yok", e);
        }
    }
}
