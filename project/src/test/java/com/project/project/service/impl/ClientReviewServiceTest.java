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

    @Test
    void listClients_noForm_isMissing() {
        when(clientReviewRepository.findByClient(client)).thenReturn(Optional.empty());
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.empty());

        ClientOverviewResponse overview = clientReviewService.listClients().get(0);

        assertEquals("MISSING", overview.getIntakeStatus());
        assertEquals("betul", overview.getUsername());
    }

    @Test
    void listClients_neverReviewed_formIsNewAndCountsClientEnteredWeightsSinceEpoch() {
        when(clientReviewRepository.findByClient(client)).thenReturn(Optional.empty());
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.of(new IntakeForm(client)));
        when(weightEntryRepository.countByUserAndEnteredByAndCreatedAtAfter(eq(client), eq(client), any()))
                .thenReturn(3L);

        ClientOverviewResponse overview = clientReviewService.listClients().get(0);

        assertEquals("NEW", overview.getIntakeStatus());
        assertEquals(3L, overview.getNewWeightCount());
        // Danışanın kendi girdiği kilolar sayılır (diyetisyenin girdikleri değil), hiç bakılmadıysa en baştan
        verify(weightEntryRepository).countByUserAndEnteredByAndCreatedAtAfter(client, client, ClientReviewService.NEVER);
    }

    @Test
    void listClients_reviewedAfterSubmissionWithChanges_isUpdated() {
        IntakeForm form = new IntakeForm(client);
        form.addChangedFields(List.of("medications"));
        ClientReview review = new ClientReview(client);
        when(clientReviewRepository.findByClient(client)).thenReturn(Optional.of(review));
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.of(form));

        ClientOverviewResponse overview = clientReviewService.listClients().get(0);

        assertEquals("UPDATED", overview.getIntakeStatus());
        verify(weightEntryRepository).countByUserAndEnteredByAndCreatedAtAfter(client, client, review.getReviewedAt());
    }

    @Test
    void listClients_reviewedAfterSubmissionWithoutChanges_isSeen() {
        IntakeForm form = new IntakeForm(client);
        when(clientReviewRepository.findByClient(client)).thenReturn(Optional.of(new ClientReview(client)));
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.of(form));

        assertEquals("SEEN", clientReviewService.listClients().get(0).getIntakeStatus());
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
        when(clientReviewRepository.findByClient(client)).thenReturn(Optional.empty());
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.empty());
        when(dietPlanRepository.existsByClient(client)).thenReturn(true);

        assertTrue(clientReviewService.listClients().get(0).isHasPlan());
    }
}
