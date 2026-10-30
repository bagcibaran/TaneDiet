package com.project.project.service.impl;

import com.project.project.dto.IntakeFormRequest;
import com.project.project.dto.IntakeFormResponse;
import com.project.project.entity.IntakeForm;
import com.project.project.entity.IntakeOptions.*;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import com.project.project.exception.IntakeConsentRequiredException;
import com.project.project.exception.UserNotFoundException;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class IntakeFormServiceTest {

    @Mock
    private IntakeFormRepository intakeFormRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WeightEntryRepository weightEntryRepository;

    @Mock
    private ConsentService consentService;

    private IntakeFormService intakeFormService;

    private User client;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        intakeFormService = new IntakeFormService(intakeFormRepository, userRepository, weightEntryRepository, consentService);

        client = new User("betul", "betul@test.com", "hash");
        client.setId(41L);
        when(userRepository.findByUsername("betul")).thenReturn(Optional.of(client));
        // save() kaydedilen nesneyi geri versin (veritabanı gibi)
        when(intakeFormRepository.save(any(IntakeForm.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    // Bütün zorunlu alanları dolu, geçerli bir istek
    private IntakeFormRequest validRequest() {
        IntakeFormRequest request = new IntakeFormRequest();
        request.setFullName("Betül Yılmaz");
        request.setBirthDate(LocalDate.of(1995, 5, 10));
        request.setGender(Gender.FEMALE);
        request.setHeightCm(165);
        request.setWeightKg(new BigDecimal("72.40"));
        request.setOccupation("Öğretmen");
        request.setMainMeals(MainMeals.THREE);
        request.setEatsBreakfast(true);
        request.setWaterIntake(WaterIntake.ONE_AND_HALF_LITER);
        request.setTeaCoffee(TeaCoffee.TWO_CUPS);
        request.setDrinksSoda(false);
        request.setGoal(Goal.LOSE_WEIGHT);
        request.setProgramStyle(ProgramStyle.FLEXIBLE);
        request.setSleepHours(SleepHours.FROM_6_TO_8);
        request.setEnergyLevel(EnergyLevel.MODERATELY_TIRED);
        request.setSmokes(false);
        request.setDrinksAlcohol(false);
        request.setExerciseDays(ExerciseDays.ONE_TO_TWO);
        request.setSportCardio(true);
        request.setSportWeights(false);
        request.setSportPilatesYoga(false);
        request.setTracksSteps(false);
        return request;
    }

    @Test
    void saveMyForm_firstTimeWithoutConsent_throws() {
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.empty());
        IntakeFormRequest request = validRequest();
        request.setConsent(false);

        assertThrows(IntakeConsentRequiredException.class, () -> intakeFormService.saveMyForm("betul", request));
        verify(intakeFormRepository, never()).save(any());
    }

    @Test
    void saveMyForm_firstTime_savesConsentTimeAndSeedsWeight() {
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.empty());
        when(weightEntryRepository.existsByUser(client)).thenReturn(false);
        IntakeFormRequest request = validRequest();
        request.setConsent(true);

        IntakeFormResponse response = intakeFormService.saveMyForm("betul", request);

        assertNotNull(response.getConsentGivenAt());
        ArgumentCaptor<WeightEntry> seeded = ArgumentCaptor.forClass(WeightEntry.class);
        verify(weightEntryRepository).save(seeded.capture());
        assertEquals(0, seeded.getValue().getWeightKg().compareTo(new BigDecimal("72.40")));
        assertEquals(LocalDate.now(), seeded.getValue().getMeasuredOn());
        assertSame(client, seeded.getValue().getUser());
        assertSame(client, seeded.getValue().getEnteredBy());
    }

    @Test
    void saveMyForm_firstTime_doesNotSeedWhenWeightsExist() {
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.empty());
        when(weightEntryRepository.existsByUser(client)).thenReturn(true);
        IntakeFormRequest request = validRequest();
        request.setConsent(true);

        intakeFormService.saveMyForm("betul", request);

        verify(weightEntryRepository, never()).save(any());
    }

    @Test
    void saveMyForm_update_keepsConsentAndDoesNotSeed() {
        IntakeForm existing = new IntakeForm(client);
        LocalDateTime consentTime = LocalDateTime.of(2026, 10, 1, 9, 0);
        existing.setConsentGivenAt(consentTime);
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.of(existing));
        IntakeFormRequest request = validRequest();
        request.setConsent(null);
        request.setMedications("D vitamini");

        IntakeFormResponse response = intakeFormService.saveMyForm("betul", request);

        assertEquals(consentTime, response.getConsentGivenAt());
        assertEquals("D vitamini", response.getMedications());
        verify(weightEntryRepository, never()).save(any());
    }

    @Test
    void getMyForm_noForm_returnsEmpty() {
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.empty());

        assertTrue(intakeFormService.getMyForm("betul").isEmpty());
    }

    @Test
    void getClientForm_dietitianId_throwsUserNotFound() {
        User dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setId(28L);
        dietitian.setRole(Role.DIETITIAN);
        when(userRepository.findById(28L)).thenReturn(Optional.of(dietitian));

        assertThrows(UserNotFoundException.class, () -> intakeFormService.getClientForm(28L));
    }

    @Test
    void response_ageComputedFromBirthDate() {
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.empty());
        when(weightEntryRepository.existsByUser(client)).thenReturn(true);
        IntakeFormRequest request = validRequest();
        request.setBirthDate(LocalDate.now().minusYears(30));
        request.setConsent(true);

        IntakeFormResponse response = intakeFormService.saveMyForm("betul", request);

        assertEquals(30, response.getAge());
    }

    // İlk gönderimdeki formu kaydedip geri verir (güncelleme testleri için hazır form)
    private IntakeForm submittedForm() {
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.empty());
        when(weightEntryRepository.existsByUser(client)).thenReturn(true);
        IntakeFormRequest first = validRequest();
        first.setConsent(true);
        intakeFormService.saveMyForm("betul", first);

        ArgumentCaptor<IntakeForm> saved = ArgumentCaptor.forClass(IntakeForm.class);
        verify(intakeFormRepository).save(saved.capture());
        IntakeForm form = saved.getValue();
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.of(form));
        return form;
    }

    @Test
    void saveMyForm_firstTime_hasNoChangedFields() {
        IntakeForm form = submittedForm();

        assertTrue(form.getChangedFields().isEmpty());
    }

    @Test
    void saveMyForm_update_recordsOnlyChangedFields() {
        IntakeForm form = submittedForm();
        IntakeFormRequest update = validRequest();
        update.setMedications("D vitamini");
        update.setWeightKg(new BigDecimal("72.4")); // aynı sayı, farklı yazım: değişiklik sayılmaz

        intakeFormService.saveMyForm("betul", update);

        assertEquals(java.util.List.of("medications"), form.getChangedFields());
    }

    @Test
    void saveMyForm_secondUpdate_accumulatesChangedFieldsWithoutDuplicates() {
        IntakeForm form = submittedForm();
        IntakeFormRequest update = validRequest();
        update.setMedications("D vitamini");
        intakeFormService.saveMyForm("betul", update);

        IntakeFormRequest second = validRequest();
        second.setMedications("Demir");
        second.setGoal(Goal.MAINTAIN_WEIGHT);
        intakeFormService.saveMyForm("betul", second);

        assertEquals(java.util.List.of("medications", "goal"), form.getChangedFields());
    }

    // KVKK: ilk gönderimde hangi rıza metni sürümünün onaylandığı kaydedilir; güncellemelerde tekrar kaydedilmez
    @Test
    void firstSaveRecordsConsent() {
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.empty());
        IntakeFormRequest request = validRequest();
        request.setConsent(true);

        intakeFormService.saveMyForm("betul", request);

        verify(consentService, times(1)).recordCurrent(client);
    }

    @Test
    void updateDoesNotRecordConsent() {
        when(intakeFormRepository.findByUser(client)).thenReturn(Optional.of(new IntakeForm(client)));
        IntakeFormRequest request = validRequest();
        request.setConsent(null);

        intakeFormService.saveMyForm("betul", request);

        verify(consentService, never()).recordCurrent(any());
    }
}
