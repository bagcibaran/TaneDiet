package com.project.project.service.impl;

import com.project.project.entity.ConsentRecord;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.ConsentVersionException;
import com.project.project.legal.LegalTexts;
import com.project.project.repository.ConsentRecordRepository;
import com.project.project.repository.IntakeFormRepository;
import com.project.project.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ConsentServiceTest {

    @Mock
    private ConsentRecordRepository consentRecordRepository;

    @Mock
    private IntakeFormRepository intakeFormRepository;

    @Mock
    private UserRepository userRepository;

    private ConsentService service;
    private User client;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        Clock clock = Clock.fixed(Instant.parse("2026-10-30T09:00:00Z"), ZoneId.of("Europe/Istanbul"));
        service = new ConsentService(consentRecordRepository, intakeFormRepository, userRepository, clock);

        client = new User("ayse", "ayse@test.com", "hash");
        client.setId(41L);
        when(userRepository.findByUsername("ayse")).thenReturn(Optional.of(client));
        when(consentRecordRepository.save(any(ConsentRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private ConsentRecord record(String version) {
        return new ConsentRecord(client, version, ConsentService.currentHash(), LocalDateTime.of(2026, 1, 1, 10, 0));
    }

    // Formu olmayan yeni danışan ilk onayını formdaki kutuyla verir: ayrı onay ekranına gönderilmez
    @Test
    void clientWithoutIntakeNeverNeedsConsent() {
        when(intakeFormRepository.existsByUser(client)).thenReturn(false);

        assertFalse(service.needsConsent(client));
    }

    // Eski danışan: yalnızca formdaki eski onay saati var, kayıt yok → bir kez onay ekranı
    @Test
    void oldClientWithoutRecordNeedsConsent() {
        when(intakeFormRepository.existsByUser(client)).thenReturn(true);
        when(consentRecordRepository.findFirstByUserOrderByAcceptedAtDesc(client)).thenReturn(Optional.empty());

        assertTrue(service.needsConsent(client));
    }

    @Test
    void currentVersionPasses() {
        when(intakeFormRepository.existsByUser(client)).thenReturn(true);
        when(consentRecordRepository.findFirstByUserOrderByAcceptedAtDesc(client))
                .thenReturn(Optional.of(record(LegalTexts.CONSENT_VERSION)));

        assertFalse(service.needsConsent(client));
    }

    @Test
    void olderVersionNeedsConsent() {
        when(intakeFormRepository.existsByUser(client)).thenReturn(true);
        when(consentRecordRepository.findFirstByUserOrderByAcceptedAtDesc(client)).thenReturn(Optional.of(record("2020-01-01")));

        assertTrue(service.needsConsent(client));
    }


    // Metin değişti ama sürüm güncellenmeyi unutuldu: yine de yeniden onay istenir
    @Test
    void changedTextWithSameVersionNeedsConsent() {
        when(intakeFormRepository.existsByUser(client)).thenReturn(true);
        when(consentRecordRepository.findFirstByUserOrderByAcceptedAtDesc(client)).thenReturn(Optional.of(
                new ConsentRecord(client, LegalTexts.CONSENT_VERSION, "0".repeat(64), LocalDateTime.of(2026, 1, 1, 10, 0))));

        assertTrue(service.needsConsent(client));
    }
    @Test
    void dietitianNeverNeedsConsent() {
        User dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setRole(Role.DIETITIAN);

        assertFalse(service.needsConsent(dietitian));
        verifyNoInteractions(intakeFormRepository);
    }

    // Kullanıcı eski sayfayı açıkken metin değiştiyse: eski sürüme onay kaydedilmez
    @Test
    void acceptStaleVersionIs409() {
        assertThrows(ConsentVersionException.class, () -> service.accept("ayse", "2020-01-01"));
        verify(consentRecordRepository, never()).save(any());
    }

    @Test
    void acceptSavesVersionHashAndTime() {
        service.accept("ayse", LegalTexts.CONSENT_VERSION);

        ArgumentCaptor<ConsentRecord> saved = ArgumentCaptor.forClass(ConsentRecord.class);
        verify(consentRecordRepository).save(saved.capture());
        assertSame(client, saved.getValue().getUser());
        assertEquals(LegalTexts.CONSENT_VERSION, saved.getValue().getVersion());
        assertEquals(ConsentService.currentHash(), saved.getValue().getTextHash());
        assertTrue(saved.getValue().getTextHash().matches("[0-9a-f]{64}"));
        assertEquals(LocalDateTime.of(2026, 10, 30, 12, 0), saved.getValue().getAcceptedAt());
    }
}
