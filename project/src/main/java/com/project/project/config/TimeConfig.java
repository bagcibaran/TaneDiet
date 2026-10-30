package com.project.project.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.Clock;
import java.time.ZoneId;

// "Bugün" her yerde Türkiye saatine göre: sunucu başka saat diliminde çalışsa da danışan son gününde erken kilitlenmesin.
// Testlerde sabit bir Clock verilerek tarih kontrol edilir.
// @EnableScheduling: zamanlanmış işler (KVKK saklama süresi, RetentionJob) çalışsın.
@Configuration
@EnableScheduling
public class TimeConfig {

    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("Europe/Istanbul"));
    }
}
