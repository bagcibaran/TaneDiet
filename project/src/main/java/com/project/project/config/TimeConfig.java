package com.project.project.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.Clock;
import java.time.ZoneId;
import java.util.TimeZone;

// "Bugün" her yerde Türkiye saatine göre: sunucu başka saat diliminde çalışsa da danışan son gününde erken kilitlenmesin.
// Testlerde sabit bir Clock verilerek tarih kontrol edilir.
// @EnableScheduling: zamanlanmış işler (KVKK saklama süresi, RetentionJob) çalışsın.
@Configuration
@EnableScheduling
public class TimeConfig {

    // Uygulamanın tek saat dilimi
    public static final ZoneId ZONE = ZoneId.of("Europe/Istanbul");

    // Uygulama açılırken (main) çağrılır: entity'lerdeki LocalDateTime.now() ve kütüphaneler de Türkiye saatini kullanır.
    // Sunucu UTC'de olsa bile gece 00:00-03:00 arası "bugün" bir gün geride kalmaz.
    public static void applyDefaultZone() {
        TimeZone.setDefault(TimeZone.getTimeZone(ZONE));
    }

    // Clock bean'i her açılışta oluşur: main'den geçmeyen başlatmalarda da (ör. @SpringBootTest, WAR) saat dilimi ayarlanmış olur
    @Bean
    public Clock clock() {
        applyDefaultZone();
        return Clock.system(ZONE);
    }
}
