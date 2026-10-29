package com.project.project.security;

import com.project.project.exception.TooManyAttemptsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.*;

class AuthRateLimiterTest {

    // Testte zamanı ileri sarabilmek için ayarlanabilir saat
    static class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-10-29T09:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneId.of("Europe/Istanbul");
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }

    private MutableClock clock;
    private AuthRateLimiter limiter;

    @BeforeEach
    void setUp() {
        clock = new MutableClock();
        limiter = new AuthRateLimiter(clock);
    }

    private void fail(String email, String ip, int times) {
        for (int i = 0; i < times; i++) {
            limiter.recordLoginFailure(email, ip);
        }
    }

    @Test
    void blocksEmailAfterFiveFailures() {
        fail("ayse@test.com", "1.1.1.1", 4);
        assertDoesNotThrow(() -> limiter.checkLogin("ayse@test.com", "1.1.1.1"));

        fail("ayse@test.com", "1.1.1.1", 1);
        assertThrows(TooManyAttemptsException.class, () -> limiter.checkLogin("ayse@test.com", "1.1.1.1"));
        // Başka bir IP'den de aynı hesap denenemez
        assertThrows(TooManyAttemptsException.class, () -> limiter.checkLogin("AYSE@test.com", "2.2.2.2"));
    }

    @Test
    void unblocksAfterFifteenMinutes() {
        fail("ayse@test.com", "1.1.1.1", 5);

        clock.advance(Duration.ofMinutes(15).plusSeconds(1));

        assertDoesNotThrow(() -> limiter.checkLogin("ayse@test.com", "1.1.1.1"));
    }

    @Test
    void successClearsEmailFailures() {
        fail("ayse@test.com", "1.1.1.1", 4);

        limiter.recordLoginSuccess("ayse@test.com");
        fail("ayse@test.com", "1.1.1.1", 4);

        assertDoesNotThrow(() -> limiter.checkLogin("ayse@test.com", "1.1.1.1"));
    }

    // Aynı IP'den farklı hesaplar denenirse (hesap tarama) IP engellenir
    @Test
    void blocksIpAfterTwentyFailuresAcrossAccounts() {
        for (int i = 0; i < 20; i++) {
            limiter.recordLoginFailure("user" + i + "@test.com", "9.9.9.9");
        }

        assertThrows(TooManyAttemptsException.class, () -> limiter.checkLogin("new@test.com", "9.9.9.9"));
        assertDoesNotThrow(() -> limiter.checkLogin("new@test.com", "8.8.8.8"));
    }

    // Kayıt ve davet kontrolü: IP başına 15 dakikada 30 istek
    @Test
    void publicRequestsLimitedPerIp() {
        for (int i = 0; i < 30; i++) {
            limiter.checkPublic("5.5.5.5");
        }

        assertThrows(TooManyAttemptsException.class, () -> limiter.checkPublic("5.5.5.5"));
        assertDoesNotThrow(() -> limiter.checkPublic("6.6.6.6"));

        clock.advance(Duration.ofMinutes(16));
        assertDoesNotThrow(() -> limiter.checkPublic("5.5.5.5"));
    }
}
