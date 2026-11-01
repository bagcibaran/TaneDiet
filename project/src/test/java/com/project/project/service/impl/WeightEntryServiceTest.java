package com.project.project.service.impl;

import com.project.project.dto.WeightSummaryResponse;
import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import com.project.project.repository.UserRepository;
import com.project.project.repository.WeightEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class WeightEntryServiceTest {

    @Mock private WeightEntryRepository weightEntryRepository;
    @Mock private UserRepository userRepository;

    private WeightEntryService service;
    private User client;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // UTC'de 10 Mart 22:30 = Türkiye'de 11 Mart 01:30: "bugün" 11 Mart olmalı
        Clock clock = Clock.fixed(Instant.parse("2026-03-10T22:30:00Z"), ZoneId.of("Europe/Istanbul"));
        service = new WeightEntryService(weightEntryRepository, userRepository, clock);
        client = new User("ayse", "ayse@test.com", "hash");
        when(userRepository.findByUsername("ayse")).thenReturn(Optional.of(client));
    }

    // Son 7 gün değişimi saatin "bugün"üne göre hesaplanır (sunucunun saat dilimine göre değil)
    @Test
    void summaryUsesClockToday() {
        when(weightEntryRepository.findAllByUserOrderByMeasuredOnDescCreatedAtDesc(client)).thenReturn(List.of(
                new WeightEntry(client, new BigDecimal("74.0"), LocalDate.of(2026, 3, 11), client),
                new WeightEntry(client, new BigDecimal("75.0"), LocalDate.of(2026, 3, 4), client)));

        WeightSummaryResponse summary = service.getMySummary("ayse");

        assertEquals(0, new BigDecimal("-1.0").compareTo(summary.getChangeLast7DaysKg()));
    }
}
