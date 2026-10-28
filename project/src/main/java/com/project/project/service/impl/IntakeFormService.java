package com.project.project.service.impl;

import com.project.project.dto.IntakeFormRequest;
import com.project.project.dto.IntakeFormResponse;
import com.project.project.entity.IntakeForm;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import com.project.project.exception.IntakeConsentRequiredException;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.IntakeFormRepository;
import com.project.project.repository.UserRepository;
import com.project.project.repository.WeightEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class IntakeFormService {

    private final IntakeFormRepository intakeFormRepository;
    private final UserRepository userRepository;
    private final WeightEntryRepository weightEntryRepository;

    public IntakeFormService(
            IntakeFormRepository intakeFormRepository,
            UserRepository userRepository,
            WeightEntryRepository weightEntryRepository
    ) {
        this.intakeFormRepository = intakeFormRepository;
        this.userRepository = userRepository;
        this.weightEntryRepository = weightEntryRepository;
    }

    // ---------- Danışan: kendi formu ----------

    // Form henüz doldurulmadıysa boş döner (controller 204 verir)
    public Optional<IntakeFormResponse> getMyForm(String username) {
        User user = findUserByUsername(username);
        return intakeFormRepository.findByUser(user).map(IntakeFormResponse::new);
    }

    // Yoksa oluşturur, varsa günceller. Form ve ilk kilo kaydı birlikte kaydedilsin diye tek transaction.
    @Transactional
    public IntakeFormResponse saveMyForm(String username, IntakeFormRequest request) {
        User user = findUserByUsername(username);
        Optional<IntakeForm> existing = intakeFormRepository.findByUser(user);
        boolean firstTime = existing.isEmpty();

        // İlk gönderimde açık rıza zorunlu (KVKK); güncellemelerde tekrar sorulmaz
        if (firstTime && !Boolean.TRUE.equals(request.getConsent())) {
            throw new IntakeConsentRequiredException("Devam etmek için açık rıza onayı gerekli");
        }

        IntakeForm form = existing.orElseGet(() -> new IntakeForm(user));
        apply(form, request);

        if (firstTime) {
            form.setConsentGivenAt(LocalDateTime.now());
            // Formdaki kilo ilk kilo kaydı olur; danışanın zaten kaydı varsa grafiği bozmamak için eklenmez
            if (!weightEntryRepository.existsByUser(user)) {
                weightEntryRepository.save(new WeightEntry(user, request.getWeightKg(), LocalDate.now(), user));
            }
        } else {
            form.touch();
        }

        return new IntakeFormResponse(intakeFormRepository.save(form));
    }

    // ---------- Diyetisyen: bir danışanın formu ----------

    public Optional<IntakeFormResponse> getClientForm(Long clientId) {
        User client = findClientById(clientId);
        return intakeFormRepository.findByUser(client).map(IntakeFormResponse::new);
    }

    // ---------- Yardımcılar ----------

    // İstekteki bütün cevapları forma kopyalar
    private void apply(IntakeForm form, IntakeFormRequest request) {
        // 1. Kişisel bilgiler
        form.setFullName(request.getFullName().trim());
        form.setBirthDate(request.getBirthDate());
        form.setGender(request.getGender());
        form.setHeightCm(request.getHeightCm());
        form.setWeightKg(request.getWeightKg());
        form.setOccupation(request.getOccupation().trim());
        // 2. Sağlık geçmişi
        form.setChronicDiseases(blankToNull(request.getChronicDiseases()));
        form.setSurgeries(blankToNull(request.getSurgeries()));
        form.setMedications(blankToNull(request.getMedications()));
        form.setAllergies(blankToNull(request.getAllergies()));
        // 3. Beslenme alışkanlıkları
        form.setMainMeals(request.getMainMeals());
        form.setEatsBreakfast(request.getEatsBreakfast());
        form.setWaterIntake(request.getWaterIntake());
        form.setTeaCoffee(request.getTeaCoffee());
        form.setDrinksSoda(request.getDrinksSoda());
        form.setDislikedFoods(blankToNull(request.getDislikedFoods()));
        form.setSnacks(blankToNull(request.getSnacks()));
        form.setEatingOut(blankToNull(request.getEatingOut()));
        // 4. Hedef ve beklentiler
        form.setGoal(request.getGoal());
        form.setGoalOther(blankToNull(request.getGoalOther()));
        form.setPreviousDiets(blankToNull(request.getPreviousDiets()));
        form.setSpecialDiet(blankToNull(request.getSpecialDiet()));
        form.setProgramStyle(request.getProgramStyle());
        // 5. Yaşam tarzı
        form.setSleepHours(request.getSleepHours());
        form.setEnergyLevel(request.getEnergyLevel());
        form.setSmokes(request.getSmokes());
        form.setDrinksAlcohol(request.getDrinksAlcohol());
        form.setAlcoholFrequency(blankToNull(request.getAlcoholFrequency()));
        // 6. Spor ve hareketlilik
        form.setExerciseDays(request.getExerciseDays());
        form.setSportCardio(request.getSportCardio());
        form.setSportWeights(request.getSportWeights());
        form.setSportPilatesYoga(request.getSportPilatesYoga());
        form.setSportOther(blankToNull(request.getSportOther()));
        form.setTracksSteps(request.getTracksSteps());
        form.setAverageSteps(request.getAverageSteps());
        // 7. Mide ve bağırsak sağlığı
        form.setDigestiveProblems(blankToNull(request.getDigestiveProblems()));
        form.setLactoseGlutenSymptoms(blankToNull(request.getLactoseGlutenSymptoms()));
    }

    // Boş veya yalnızca boşluk olan cevaplar "cevap yok" olarak saklanır
    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı: " + username));
    }

    private User findClientById(Long clientId) {
        User user = userRepository.findById(clientId)
                .orElseThrow(() -> new UserNotFoundException("Danışan bulunamadı, id: " + clientId));

        if (user.getRole() != Role.CLIENT) {
            throw new UserNotFoundException("Danışan bulunamadı, id: " + clientId);
        }

        return user;
    }
}
