package com.project.project.service.impl;

import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.repository.AccessLogRepository;
import com.project.project.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RetentionJobTest {

    @Mock private UserRepository userRepository;
    @Mock private ClientDataService clientDataService;
    @Mock private AccessLogRepository accessLogRepository;

    private RetentionJob job;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Bugün = 29 Ekim 2026 (Türkiye saati)
        Clock clock = Clock.fixed(Instant.parse("2026-10-29T09:00:00Z"), ZoneId.of("Europe/Istanbul"));
        job = new RetentionJob(userRepository, clientDataService, accessLogRepository, clock);
    }

    private User clientUntil(long id, LocalDate accessUntil) {
        User client = new User("c" + id, "c" + id + "@test.com", "hash");
        client.setId(id);
        client.setAccessUntil(accessUntil);
        return client;
    }

    // Son gün tam 2 yıl önceyse kalır (sorgu "before" = kesinlikle önce), bir gün daha eskiyse silinir
    @Test
    void boundary() {
        User old = clientUntil(7L, LocalDate.of(2024, 10, 28));
        when(userRepository.findAllByRoleAndAccessUntilBefore(Role.CLIENT, LocalDate.of(2024, 10, 29)))
                .thenReturn(List.of(old));

        job.run();

        verify(userRepository).findAllByRoleAndAccessUntilBefore(Role.CLIENT, LocalDate.of(2024, 10, 29));
        verify(clientDataService).deleteExpired(7L, LocalDate.of(2024, 10, 29));
    }

    // Süresiz (accessUntil = NULL) danışan sorguya hiç girmez: SQL'de NULL < tarih doğru değildir
    @Test
    void unlimitedNeverDeleted() {
        when(userRepository.findAllByRoleAndAccessUntilBefore(any(), any())).thenReturn(List.of());

        job.run();

        verify(clientDataService, never()).deleteExpired(any(), any());
    }

    // Biri silinemezse diğerleri yine silinir, eski kayıtlar yine temizlenir
    @Test
    void oneFailureDoesNotStopOthers() {
        User first = clientUntil(1L, LocalDate.of(2023, 1, 1));
        User second = clientUntil(2L, LocalDate.of(2023, 2, 1));
        when(userRepository.findAllByRoleAndAccessUntilBefore(any(), any())).thenReturn(List.of(first, second));
        doThrow(new RuntimeException("db")).when(clientDataService).deleteExpired(eq(1L), any());

        job.run();

        verify(clientDataService).deleteExpired(eq(2L), any());
        verify(accessLogRepository).deleteOlderThan(any());
    }

    // 2 yıldan eski erişim kayıtları da silinir
    @Test
    void purgesOldLogs() {
        when(userRepository.findAllByRoleAndAccessUntilBefore(any(), any())).thenReturn(List.of());

        job.run();

        verify(accessLogRepository).deleteOlderThan(LocalDateTime.of(2024, 10, 29, 12, 0));
    }
}
