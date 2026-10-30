package com.project.project.service.impl;

import com.project.project.dto.AccessLogResponse;
import com.project.project.entity.AccessLog;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.repository.AccessLogRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AccessLogServiceTest {

    @Mock private AccessLogRepository accessLogRepository;
    @Mock private UserRepository userRepository;

    private AccessLogService service;
    private User client;
    private User dietitian;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        Clock clock = Clock.fixed(Instant.parse("2026-10-30T09:00:00Z"), ZoneId.of("Europe/Istanbul"));
        service = new AccessLogService(accessLogRepository, userRepository, clock);
        client = new User("ayse", "ayse@test.com", "hash");
        client.setId(41L);
        dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setRole(Role.DIETITIAN);
        when(userRepository.findById(41L)).thenReturn(Optional.of(client));
        when(userRepository.findByUsername("diyetisyen")).thenReturn(Optional.of(dietitian));
    }

    // Ön görüşme formu görüntülenince kim, kimi, ne zaman kaydedilir; içerik kaydedilmez
    @Test
    void viewIntakeIsLogged() {
        service.record("diyetisyen", 41L, AccessLog.Action.VIEW_INTAKE);

        ArgumentCaptor<AccessLog> log = ArgumentCaptor.forClass(AccessLog.class);
        verify(accessLogRepository).save(log.capture());
        assertSame(dietitian, log.getValue().getViewer());
        assertSame(client, log.getValue().getClient());
        assertEquals(AccessLog.Action.VIEW_INTAKE, log.getValue().getAction());
        assertEquals(LocalDateTime.of(2026, 10, 30, 12, 0), log.getValue().getCreatedAt());
    }

    @Test
    void listShowsViewerNameAndAction() {
        when(accessLogRepository.findAllByClientOrderByCreatedAtDesc(client)).thenReturn(List.of(
                new AccessLog(dietitian, client, AccessLog.Action.EXPORT, LocalDateTime.of(2026, 10, 29, 10, 0))));

        List<AccessLogResponse> list = service.list(41L);

        assertEquals(1, list.size());
        assertEquals("EXPORT", list.get(0).getAction());
        assertEquals("diyetisyen", list.get(0).getViewer());
        verify(accessLogRepository, never()).save(any());
    }
}
