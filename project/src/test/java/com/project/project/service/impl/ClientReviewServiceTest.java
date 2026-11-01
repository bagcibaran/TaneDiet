package com.project.project.service.impl;

import com.project.project.dto.ClientActivityResponse;
import com.project.project.dto.ClientOverviewResponse;
import com.project.project.entity.ClientReview;
import com.project.project.entity.IntakeForm;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.ClientReviewRepository;
import com.project.project.repository.DietPlanRepository;
import com.project.project.repository.IntakeFormRepository;
import com.project.project.repository.UserRepository;
import com.project.project.repository.WeightEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ClientReviewServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientReviewRepository clientReviewRepository;

    @Mock
    private IntakeFormRepository intakeFormRepository;

    @Mock
    private WeightEntryRepository weightEntryRepository;

    @Mock
    private DietPlanRepository dietPlanRepository;

    private ClientReviewService clientReviewService;

    private User client;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        clientReviewService = new ClientReviewService(
                userRepository, clientReviewRepository, intakeFormRepository, weightEntryRepository, dietPlanRepository,
                new ClientAccessService(userRepository, java.time.Clock.systemDefaultZone()));

        client = new User("betul", "betul@test.com", "hash");
        client.setId(41L);
        when(userRepository.findAllByRoleOrderByUsernameAsc(Role.CLIENT)).thenReturn(List.of(client));
        when(userRepository.findById(41L)).thenReturn(Optional.of(client));
    }

    // Liste toplu sorgularla hazırlanır: verilen danışanların inceleme ve formları, programı olanlar, yeni kilo sayıları
    private void stubBatch(List<ClientReview> reviews, List<IntakeForm> forms, List<Long> withPlan, List<Object[]> newWeightCounts) {
        when(clientReviewRepository.findAllByClientIn(any())).thenReturn(reviews);
        when(intakeFormRepository.findAllByUserIn(any())).thenReturn(forms);
        when(dietPlanRepository.findClientIdsWithPlan()).thenReturn(withPlan);
        when(weightEntryRepository.countNewClientWeights()).thenReturn(newWeightCounts);
    }

    @Test
    void listClients_noForm_isMissing() {
        stubBatch(List.of(), List.of(), List.of(), List.of());

        ClientOverviewResponse overview = clientReviewService.listClients().get(0);

        assertEquals("MISSING", overview.getIntakeStatus());
        assertEquals("betul", overview.getUsername());
        assertEquals(0L, overview.getNewWeightCount());
        assertFalse(overview.isHasPlan());
    }

    // Yeni kilo sayısı toplu sorgudan gelir (danışanın kendi girdikleri, son incelemeden sonra; hiç bakılmadıysa hepsi)
    @Test
    void listClients_neverReviewed_formIsNewAndUsesNewWeightCount() {
        stubBatch(List.of(), List.of(new IntakeForm(client)), List.of(41L), List.<Object[]>of(new Object[] {41L, 3L}));

        ClientOverviewResponse overview = clientReviewService.listClients().get(0);

        assertEquals("NEW", overview.getIntakeStatus());
        assertEquals(3L, overview.getNewWeightCount());
        assertTrue(overview.isHasPlan());
    }

    @Test
    void listClients_reviewedAfterSubmissionWithChanges_isUpdated() {
        IntakeForm form = new IntakeForm(client);
        form.addChangedFields(List.of("medications"));
        stubBatch(List.of(new ClientReview(client)), List.of(form), List.of(), List.of());

        assertEquals("UPDATED", clientReviewService.listClients().get(0).getIntakeStatus());
    }

    @Test
    void listClients_reviewedAfterSubmissionWithoutChanges_isSeen() {
        stubBatch(List.of(new ClientReview(client)), List.of(new IntakeForm(client)), List.of(), List.of());

        assertEquals("SEEN", clientReviewService.listClients().get(0).getIntakeStatus());
    }

    // Danışan sayısı ne olursa olsun sabit sayıda sorgu: danışan başına sorgu yok
    @Test
    void listUsesConstantQueries() {
        User second = new User("ayse", "ayse@test.com", "hash");
        second.setId(42L);
        when(userRepository.findAllByRoleOrderByUsernameAsc(Role.CLIENT)).thenReturn(List.of(client, second));
        stubBatch(List.of(), List.of(new IntakeForm(second)), List.of(42L), List.<Object[]>of(new Object[] {42L, 2L}));

        List<ClientOverviewResponse> list = clientReviewService.listClients();

        assertEquals("MISSING", list.get(0).getIntakeStatus());
        assertEquals("NEW", list.get(1).getIntakeStatus());
        assertEquals(2L, list.get(1).getNewWeightCount());
        assertTrue(list.get(1).isHasPlan());
        verify(clientReviewRepository, times(1)).findAllByClientIn(any());
        verify(intakeFormRepository, times(1)).findAllByUserIn(any());
        verify(dietPlanRepository, times(1)).findClientIdsWithPlan();
        verify(weightEntryRepository, times(1)).countNewClientWeights();
        verify(clientReviewRepository, never()).findByClient(any());
        verify(intakeFormRepository, never()).findByUser(any());
        verify(dietPlanRepository, never()).existsByClient(any());
        verify(weightEntryRepository, never()).countByUserAndEnteredByAndCreatedAtAfter(any(), any(), any());
    }

    @Test
    void getActivity_returnsNewWeightIdsAndChangedFields() {
        IntakeForm form = new IntakeForm(client);
        form.addChangedFields(List.of("allergies", "goal"));
        ClientReview review = new ClientReview(client);
        WeightEntry entry = new WeightEntry(client, new BigDecimal("74.0"), LocalDate.now(), client);
        when(clientReviewRepository.findByClient(client)).thenReturn(Optional.of(review));
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.of(form));
        when(weightEntryRepository.findAllByUserAndEnteredByAndCreatedAtAfter(client, client, review.getReviewedAt()))
                .thenReturn(List.of(entry));

        ClientActivityResponse activity = clientReviewService.getActivity(41L);

        assertEquals("UPDATED", activity.getIntakeStatus());
        assertEquals(List.of("allergies", "goal"), activity.getChangedFields());
        assertEquals(1, activity.getNewWeightEntryIds().size());
    }

    @Test
    void markReviewed_savesReviewTimeAndClearsChangedFields() {
        IntakeForm form = new IntakeForm(client);
        form.addChangedFields(List.of("allergies"));
        LocalDateTime formUpdatedAt = form.getUpdatedAt();
        when(clientReviewRepository.findByClient(client)).thenReturn(Optional.empty());
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.of(form));

        clientReviewService.markReviewed(41L);

        ArgumentCaptor<ClientReview> saved = ArgumentCaptor.forClass(ClientReview.class);
        verify(clientReviewRepository).save(saved.capture());
        assertSame(client, saved.getValue().getClient());
        assertNotNull(saved.getValue().getReviewedAt());
        assertTrue(form.getChangedFields().isEmpty());
        // Diyetisyenin bakması danışanın "son güncelleme" tarihini değiştirmez
        assertEquals(formUpdatedAt, form.getUpdatedAt());
        verify(intakeFormRepository).save(form);
    }

    @Test
    void getActivity_dietitianId_throwsUserNotFound() {
        User dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setId(28L);
        dietitian.setRole(Role.DIETITIAN);
        when(userRepository.findById(28L)).thenReturn(Optional.of(dietitian));

        assertThrows(UserNotFoundException.class, () -> clientReviewService.getActivity(28L));
        assertThrows(UserNotFoundException.class, () -> clientReviewService.markReviewed(28L));
    }

    @Test
    void listClients_reportsWhetherClientHasDietPlan() {
        stubBatch(List.of(), List.of(), List.of(41L), List.of());

        assertTrue(clientReviewService.listClients().get(0).isHasPlan());
    }

    // Danışan sayfası tek danışanı ister (eskiden bütün kullanıcı listesi çekiliyordu)
    @Test
    void getClientReturnsClient() {
        assertEquals("betul", clientReviewService.getClient(41L).getUsername());
    }

    @Test
    void getClientOfDietitianIs404() {
        User dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setRole(Role.DIETITIAN);
        when(userRepository.findById(28L)).thenReturn(Optional.of(dietitian));

        assertThrows(com.project.project.exception.UserNotFoundException.class, () -> clientReviewService.getClient(28L));
    }
}
