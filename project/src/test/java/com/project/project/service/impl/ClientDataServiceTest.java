package com.project.project.service.impl;

import com.project.project.dto.ClientExportResponse;
import com.project.project.entity.AccessLog;
import com.project.project.entity.DeletionRecord;
import com.project.project.entity.DietPlan;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.AccessRuleException;
import com.project.project.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ClientDataServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private AccessLogRepository accessLogRepository;
    @Mock private ConsentRecordRepository consentRecordRepository;
    @Mock private WeightEntryRepository weightEntryRepository;
    @Mock private DietPlanRepository dietPlanRepository;
    @Mock private ClientReviewRepository clientReviewRepository;
    @Mock private IntakeFormRepository intakeFormRepository;
    @Mock private TaskRepository taskRepository;
    @Mock private InviteRepository inviteRepository;
    @Mock private DeletionRecordRepository deletionRecordRepository;
    @Mock private AccessLogService accessLogService;
    @Mock private ConsentService consentService;

    private ClientDataService service;
    private User client;
    private User dietitian;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        Clock clock = Clock.fixed(Instant.parse("2026-10-30T09:00:00Z"), ZoneId.of("Europe/Istanbul"));
        service = new ClientDataService(userRepository, accessLogRepository, consentRecordRepository, weightEntryRepository,
                dietPlanRepository, clientReviewRepository, intakeFormRepository, taskRepository, inviteRepository,
                deletionRecordRepository, accessLogService, consentService, clock);

        client = new User("ayse", "ayse@test.com", "hash");
        client.setId(41L);
        dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setId(28L);
        dietitian.setRole(Role.DIETITIAN);
        when(userRepository.findById(41L)).thenReturn(Optional.of(client));
        when(userRepository.findByUsername("diyetisyen")).thenReturn(Optional.of(dietitian));
        DietPlan plan = new DietPlan(client, dietitian);
        plan.setPlanType(DietPlan.PlanType.DAILY);
        when(dietPlanRepository.findAllByClientOrderByCreatedAtDesc(client)).thenReturn(List.of(plan));
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.empty());
    }

    // Yanlış onay: hiçbir şey silinmez
    @Test
    void deleteRequiresExactUsername() {
        assertThrows(AccessRuleException.class, () -> service.deleteOnRequest(41L, "diyetisyen", "Ayse"));

        verify(userRepository, never()).delete(any());
        verifyNoInteractions(deletionRecordRepository);
    }

    // Yabancı anahtarlar yüzünden sıra önemli: kullanıcıya bağlı her şey önce, kullanıcı en son, sonra silme kaydı
    @Test
    void deleteRemovesEverythingInFkOrder() {
        service.deleteOnRequest(41L, "diyetisyen", "ayse");

        InOrder order = inOrder(accessLogRepository, consentRecordRepository, weightEntryRepository, dietPlanRepository,
                clientReviewRepository, intakeFormRepository, taskRepository, inviteRepository, userRepository,
                deletionRecordRepository);
        order.verify(accessLogRepository).deleteAllByClient(client);
        order.verify(consentRecordRepository).deleteAllByUser(client);
        order.verify(weightEntryRepository).deleteAllByUser(client);
        order.verify(dietPlanRepository).deleteAll(anyList());
        order.verify(clientReviewRepository).deleteAllByClient(client);
        order.verify(intakeFormRepository).deleteAllByUser(client);
        order.verify(taskRepository).deleteAllByUser(client);
        order.verify(inviteRepository).clearUsedBy(client);
        order.verify(userRepository).delete(client);
        order.verify(deletionRecordRepository).save(any(DeletionRecord.class));
    }

    // Silme kaydında kişisel veri yok: yalnızca numara, silen, sebep, zaman
    @Test
    void deletionRecordHasNoPersonalData() {
        service.deleteOnRequest(41L, "diyetisyen", "ayse");

        ArgumentCaptor<DeletionRecord> record = ArgumentCaptor.forClass(DeletionRecord.class);
        verify(deletionRecordRepository).save(record.capture());
        assertEquals(41L, record.getValue().getClientId());
        assertSame(dietitian, record.getValue().getDeletedBy());
        assertEquals(DeletionRecord.Reason.REQUEST, record.getValue().getReason());
        assertEquals(LocalDateTime.of(2026, 10, 30, 12, 0), record.getValue().getDeletedAt());
    }

    // Diyetisyen yanlışlıkla başka bir diyetisyeni silemez
    @Test
    void cannotDeleteDietitian() {
        when(userRepository.findById(28L)).thenReturn(Optional.of(dietitian));

        assertThrows(com.project.project.exception.UserNotFoundException.class,
                () -> service.deleteOnRequest(28L, "diyetisyen", "diyetisyen"));
    }

    // Gece işi: liste okunduktan sonra paketi uzatılan danışan silinmez (transaction içinde yeniden kontrol)
    @Test
    void expiredButExtendedMeanwhileIsKept() {
        client.setAccessUntil(LocalDate.of(2026, 12, 31));

        assertFalse(service.deleteExpired(41L, LocalDate.of(2024, 10, 30)));
        verify(userRepository, never()).delete(any());
        verifyNoInteractions(deletionRecordRepository);
    }

    @Test
    void expiredClientIsDeletedWithRetentionReason() {
        client.setAccessUntil(LocalDate.of(2024, 1, 1));

        assertTrue(service.deleteExpired(41L, LocalDate.of(2024, 10, 30)));
        ArgumentCaptor<DeletionRecord> record = ArgumentCaptor.forClass(DeletionRecord.class);
        verify(deletionRecordRepository).save(record.capture());
        assertEquals(DeletionRecord.Reason.RETENTION, record.getValue().getReason());
        assertNull(record.getValue().getDeletedBy());
    }

    // Dışa aktarma önce kaydedilir, sonra kayıt listesiyle birlikte döner
    @Test
    void exportLogsExportAndIncludesLog() {
        service.export(41L, "diyetisyen");

        InOrder order = inOrder(accessLogService);
        order.verify(accessLogService).record("diyetisyen", 41L, AccessLog.Action.EXPORT);
        order.verify(accessLogService).list(41L);
    }

    @Test
    void exportContainsAccountAndServicePeriod() {
        ClientExportResponse export = service.export(41L, "diyetisyen");

        assertEquals("ayse", export.getClient().getUsername());
        assertNull(export.getIntake());
        assertEquals(1, export.getPlans().size());
        assertEquals(LocalDateTime.of(2026, 10, 30, 12, 0), export.getExportedAt());
    }

    private static <T> List<T> anyList() {
        return org.mockito.ArgumentMatchers.anyList();
    }
}
