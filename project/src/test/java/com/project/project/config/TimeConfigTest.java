package com.project.project.config;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.TimeZone;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TimeConfigTest {

    private TimeZone previous;

    @BeforeEach
    void rememberDefault() {
        previous = TimeZone.getDefault();
    }

    @AfterEach
    void restoreDefault() {
        TimeZone.setDefault(previous);
    }

    // Sunucu UTC'de çalışsa bile uygulamanın varsayılan saat dilimi Türkiye saati olur
    @Test
    void applyDefaultZoneSetsIstanbul() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));

        TimeConfig.applyDefaultZone();

        assertEquals("Europe/Istanbul", TimeZone.getDefault().getID());
        assertEquals("Europe/Istanbul", TimeConfig.ZONE.getId());
    }

    // main'den geçmeyen başlatmalarda da (ör. @SpringBootTest, WAR) saat dilimi ayarlanır: Clock bean'i her açılışta oluşur
    @Test
    void clockBeanAlsoSetsDefaultZone() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));

        new TimeConfig().clock();

        assertEquals("Europe/Istanbul", TimeZone.getDefault().getID());
    }
}
