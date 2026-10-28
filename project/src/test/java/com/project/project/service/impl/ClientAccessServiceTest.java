package com.project.project.service.impl;

import com.project.project.dto.ClientAccessRequest;
import com.project.project.dto.ClientAccessRequest.Action;
import com.project.project.dto.ClientAccessResponse;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.AccessRuleException;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ClientAccessServiceTest {

    private static final ZoneId ISTANBUL = ZoneId.of("Europe/Istanbul");

    @Mock
    private UserRepository userRepository;

    private ClientAccessService service;
    private User client;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Bugün = 28 Ekim 2026 (Türkiye saati)
        service = new ClientAccessService(userRepository, clockAt("2026-10-28T09:00:00Z"));

        client = new User("ayse", "ayse@test.com", "hash");
        client.setId(41L);
        when(userRepository.findById(41L)).thenReturn(Optional.of(client));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private static Clock clockAt(String instant) {
        return Clock.fixed(Instant.parse(instant), ISTANBUL);
    }

    private ClientAccessRequest request(Action action, Integer months, LocalDate date) {
        ClientAccessRequest request = new ClientAccessRequest();
        request.setAction(action);
        request.setMonths(months);
        request.setDate(date);
        return request;
    }

    // ---------- Kilit durumu ----------

    @Test
    void lastDayIsNotLocked() {
        client.setAccessUntil(LocalDate.of(2026, 10, 28));

        assertFalse(service.isLocked(client));
        assertEquals(0, service.daysLeft(client));
    }

    @Test
    void pastDayIsLocked() {
        client.setAccessUntil(LocalDate.of(2026, 10, 27));

        assertTrue(service.isLocked(client));
        assertNull(service.daysLeft(client));
    }

    @Test
    void unlimitedIsNotLocked() {
        assertFalse(service.isLocked(client));
        assertNull(service.daysLeft(client));
    }

    @Test
    void dietitianNeverLocked() {
        User dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setRole(Role.DIETITIAN);
        dietitian.setAccessUntil(LocalDate.of(2020, 1, 1));

        assertFalse(service.isLocked(dietitian));
    }

    // Türkiye'de gün başladıysa (UTC'de hâlâ dün) bugün Türkiye gününe göre sayılır
    @Test
    void todayUsesIstanbulTime() {
        ClientAccessService lateNight = new ClientAccessService(userRepository, clockAt("2026-10-27T22:30:00Z"));

        assertEquals(LocalDate.of(2026, 10, 28), lateNight.today());
    }

    // ---------- Paket ekle ----------

    @Test
    void addMonthsFromEndWhenActive() {
        client.setAccessUntil(LocalDate.of(2026, 11, 10));

        ClientAccessResponse response = service.updateAccess(41L, request(Action.ADD_MONTHS, 3, null));

        assertEquals(LocalDate.of(2027, 2, 10), response.getAccessUntil());
        assertFalse(response.isLocked());
    }

    @Test
    void addMonthsFromTodayWhenLocked() {
        client.setAccessUntil(LocalDate.of(2026, 10, 1));

        ClientAccessResponse response = service.updateAccess(41L, request(Action.ADD_MONTHS, 1, null));

        assertEquals(LocalDate.of(2026, 11, 28), response.getAccessUntil());
        assertFalse(response.isLocked());
    }

    @Test
    void addMonthsFromTodayWhenUnlimited() {
        ClientAccessResponse response = service.updateAccess(41L, request(Action.ADD_MONTHS, 6, null));

        assertEquals(LocalDate.of(2027, 4, 28), response.getAccessUntil());
    }

    @Test
    void addMonthsClampsMonthEnd() {
        ClientAccessService january31 = new ClientAccessService(userRepository, clockAt("2027-01-31T09:00:00Z"));

        ClientAccessResponse response = january31.updateAccess(41L, request(Action.ADD_MONTHS, 1, null));

        assertEquals(LocalDate.of(2027, 2, 28), response.getAccessUntil());
    }

    @Test
    void addMonthsRejectsTwo() {
        assertThrows(AccessRuleException.class, () -> service.updateAccess(41L, request(Action.ADD_MONTHS, 2, null)));
    }

    // ---------- Diğer işlemler ----------

    @Test
    void setDateCanShortenOrLock() {
        client.setAccessUntil(LocalDate.of(2027, 1, 1));

        ClientAccessResponse response = service.updateAccess(41L, request(Action.SET_DATE, null, LocalDate.of(2026, 10, 20)));

        assertEquals(LocalDate.of(2026, 10, 20), response.getAccessUntil());
        assertTrue(response.isLocked());
    }

    @Test
    void setDateWithoutDateIsRejected() {
        assertThrows(AccessRuleException.class, () -> service.updateAccess(41L, request(Action.SET_DATE, null, null)));
    }

    @Test
    void unlimitedSetsNull() {
        client.setAccessUntil(LocalDate.of(2026, 10, 1));

        ClientAccessResponse response = service.updateAccess(41L, request(Action.UNLIMITED, null, null));

        assertNull(response.getAccessUntil());
        assertFalse(response.isLocked());
    }

    @Test
    void closeNowLocksImmediately() {
        client.setAccessUntil(LocalDate.of(2027, 1, 1));

        ClientAccessResponse response = service.updateAccess(41L, request(Action.CLOSE_NOW, null, null));

        assertEquals(LocalDate.of(2026, 10, 27), response.getAccessUntil());
        assertTrue(response.isLocked());
    }

    @Test
    void nonClientIs404() {
        User dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setRole(Role.DIETITIAN);
        when(userRepository.findById(28L)).thenReturn(Optional.of(dietitian));

        assertThrows(UserNotFoundException.class, () -> service.getAccess(28L));
    }
}
