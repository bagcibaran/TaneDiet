package com.project.project.security;

import com.project.project.exception.TooManyAttemptsException;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Herkese açık uçlarda deneme sınırı (şifre deneme saldırısına karşı). Bellekte tutulur:
// sunucu yeniden başlayınca sıfırlanır, tek sunucu için yeterli.
//  - Giriş: aynı e-posta için 15 dakikada 5 hatalı deneme, aynı IP için 15 dakikada 20 hatalı deneme
//  - Kayıt ve davet kontrolü: aynı IP için 15 dakikada 30 istek
@Component
public class AuthRateLimiter {

    static final Duration WINDOW = Duration.ofMinutes(15);
    static final int MAX_FAILURES_PER_EMAIL = 5;
    static final int MAX_FAILURES_PER_IP = 20;
    static final int MAX_PUBLIC_PER_IP = 30;

    private final Clock clock;
    // anahtar ("email:...", "ip:...", "public:...") → pencere içindeki deneme zamanları
    private final Map<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    public AuthRateLimiter(Clock clock) {
        this.clock = clock;
    }

    // Girişten önce: bu e-posta ya da IP engelliyse 429
    public void checkLogin(String email, String ip) {
        if (count(emailKey(email)) >= MAX_FAILURES_PER_EMAIL || count(ipKey(ip)) >= MAX_FAILURES_PER_IP) {
            throw new TooManyAttemptsException();
        }
    }

    public void recordLoginFailure(String email, String ip) {
        add(emailKey(email));
        add(ipKey(ip));
    }

    // Doğru şifre: o hesabın hatalı denemeleri unutulur (IP sayacı kalır)
    public void recordLoginSuccess(String email) {
        attempts.remove(emailKey(email));
    }

    // Kayıt ve davet kontrolü: her istek sayılır, sınır aşılırsa 429
    public void checkPublic(String ip) {
        String key = "public:" + ip;
        if (count(key) >= MAX_PUBLIC_PER_IP) {
            throw new TooManyAttemptsException();
        }
        add(key);
    }

    private static String emailKey(String email) {
        return "email:" + (email == null ? "" : email.trim().toLowerCase(Locale.ROOT));
    }

    private static String ipKey(String ip) {
        return "ip:" + ip;
    }

    private void add(String key) {
        Deque<Instant> times = attempts.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (times) {
            prune(times);
            times.addLast(clock.instant());
        }
    }

    private int count(String key) {
        Deque<Instant> times = attempts.get(key);
        if (times == null) {
            return 0;
        }
        synchronized (times) {
            prune(times);
            if (times.isEmpty()) {
                // Bellek şişmesin: süresi dolmuş anahtar silinir
                attempts.remove(key, times);
            }
            return times.size();
        }
    }

    // Pencereden eski denemeleri atar
    private void prune(Deque<Instant> times) {
        Instant oldest = clock.instant().minus(WINDOW);
        while (!times.isEmpty() && !times.peekFirst().isAfter(oldest)) {
            times.pollFirst();
        }
    }
}
