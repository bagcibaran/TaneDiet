package com.project.project.service.impl;

import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.repository.AccessLogRepository;
import com.project.project.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;

// KVKK saklama süresi: hizmeti biteli 2 yıldan fazla olan danışanların verileri her gece kalıcı silinir.
// Her danışan ClientDataService üzerinden kendi transaction'ında yeniden okunup silinir: biri hata verirse
// diğerleri yine silinir, bu arada paketi uzatılan danışan silinmez.
@Component
public class RetentionJob {

    public static final int RETENTION_YEARS = 2;

    private static final Logger log = LoggerFactory.getLogger(RetentionJob.class);

    private final UserRepository userRepository;
    private final ClientDataService clientDataService;
    private final AccessLogRepository accessLogRepository;
    private final Clock clock;

    public RetentionJob(
            UserRepository userRepository,
            ClientDataService clientDataService,
            AccessLogRepository accessLogRepository,
            Clock clock
    ) {
        this.userRepository = userRepository;
        this.clientDataService = clientDataService;
        this.accessLogRepository = accessLogRepository;
        this.clock = clock;
    }

    // Her gece 03:30 (Türkiye saati)
    @Scheduled(cron = "0 30 3 * * *", zone = "Europe/Istanbul")
    public void run() {
        // Son günü tam 2 yıl önce olan kalır, daha eskisi silinir
        LocalDate cutoff = LocalDate.now(clock).minusYears(RETENTION_YEARS);

        for (User client : userRepository.findAllByRoleAndAccessUntilBefore(Role.CLIENT, cutoff)) {
            try {
                clientDataService.deleteExpired(client.getId(), cutoff);
            } catch (RuntimeException e) {
                // Kişisel veri loglanmaz, yalnızca numara
                log.error("Saklama süresi dolan danışan silinemedi, id: {}", client.getId(), e);
            }
        }

        accessLogRepository.deleteOlderThan(LocalDateTime.now(clock).minusYears(RETENTION_YEARS));
    }
}
