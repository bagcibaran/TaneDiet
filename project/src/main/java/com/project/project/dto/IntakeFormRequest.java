package com.project.project.dto;

import com.project.project.entity.IntakeOptions.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

// Danışanın gönderdiği ön görüşme formu. Alan listesi: docs/superpowers/plans/2026-10-28-on-gorusme-formu.md
public class IntakeFormRequest {

    @NotBlank(message = "Ad soyad boş olamaz")
    @Size(max = 100, message = "Ad soyad en fazla 100 karakter olabilir")
    private String fullName;

    @NotNull(message = "Doğum tarihi boş olamaz")
    @Past(message = "Doğum tarihi geçmişte olmalı")
    private LocalDate birthDate;

    @NotNull(message = "Cinsiyet seçilmeli")
    private Gender gender;

    @NotNull(message = "Boy boş olamaz")
    @Min(value = 100, message = "Boy en az 100 cm olmalı")
    @Max(value = 250, message = "Boy en fazla 250 cm olabilir")
    private Integer heightCm;

    @NotNull(message = "Kilo boş olamaz")
    @DecimalMin(value = "20.0", message = "Kilo en az 20 kg olmalı")
    @DecimalMax(value = "400.0", message = "Kilo en fazla 400 kg olabilir")
    @Digits(integer = 3, fraction = 2, message = "Kilo en fazla 2 ondalık basamak içerebilir")
    private BigDecimal weightKg;

    @NotBlank(message = "Meslek boş olamaz")
    @Size(max = 100, message = "Meslek en fazla 100 karakter olabilir")
    private String occupation;

    @Size(max = 2000, message = "Cevaplar en fazla 2000 karakter olabilir")
    private String chronicDiseases;

    @Size(max = 2000, message = "Cevaplar en fazla 2000 karakter olabilir")
    private String surgeries;

    @Size(max = 2000, message = "Cevaplar en fazla 2000 karakter olabilir")
    private String medications;

    @Size(max = 2000, message = "Cevaplar en fazla 2000 karakter olabilir")
    private String allergies;

    @NotNull(message = "Öğün sayısı seçilmeli")
    private MainMeals mainMeals;

    @NotNull(message = "Kahvaltı sorusu cevaplanmalı")
    private Boolean eatsBreakfast;

    @NotNull(message = "Su tüketimi seçilmeli")
    private WaterIntake waterIntake;

    @NotNull(message = "Çay/kahve tüketimi seçilmeli")
    private TeaCoffee teaCoffee;

    @NotNull(message = "Gazlı içecek sorusu cevaplanmalı")
    private Boolean drinksSoda;

    @Size(max = 2000, message = "Cevaplar en fazla 2000 karakter olabilir")
    private String dislikedFoods;

    @Size(max = 2000, message = "Cevaplar en fazla 2000 karakter olabilir")
    private String snacks;

    @Size(max = 2000, message = "Cevaplar en fazla 2000 karakter olabilir")
    private String eatingOut;

    @NotNull(message = "Hedef seçilmeli")
    private Goal goal;

    @Size(max = 255, message = "Bu alan en fazla 255 karakter olabilir")
    private String goalOther;

    @Size(max = 2000, message = "Cevaplar en fazla 2000 karakter olabilir")
    private String previousDiets;

    @Size(max = 2000, message = "Cevaplar en fazla 2000 karakter olabilir")
    private String specialDiet;

    @NotNull(message = "Program tarzı seçilmeli")
    private ProgramStyle programStyle;

    @NotNull(message = "Uyku süresi seçilmeli")
    private SleepHours sleepHours;

    @NotNull(message = "Enerji durumu seçilmeli")
    private EnergyLevel energyLevel;

    @NotNull(message = "Sigara sorusu cevaplanmalı")
    private Boolean smokes;

    @NotNull(message = "Alkol sorusu cevaplanmalı")
    private Boolean drinksAlcohol;

    @Size(max = 255, message = "Bu alan en fazla 255 karakter olabilir")
    private String alcoholFrequency;

    @NotNull(message = "Egzersiz sıklığı seçilmeli")
    private ExerciseDays exerciseDays;

    @NotNull(message = "Spor türü bilgisi eksik")
    private Boolean sportCardio;

    @NotNull(message = "Spor türü bilgisi eksik")
    private Boolean sportWeights;

    @NotNull(message = "Spor türü bilgisi eksik")
    private Boolean sportPilatesYoga;

    @Size(max = 255, message = "Bu alan en fazla 255 karakter olabilir")
    private String sportOther;

    @NotNull(message = "Adım sayısı sorusu cevaplanmalı")
    private Boolean tracksSteps;

    @Min(value = 0, message = "Adım sayısı negatif olamaz")
    private Integer averageSteps;

    @Size(max = 2000, message = "Cevaplar en fazla 2000 karakter olabilir")
    private String digestiveProblems;

    @Size(max = 2000, message = "Cevaplar en fazla 2000 karakter olabilir")
    private String lactoseGlutenSymptoms;

    // Açık rıza (KVKK). Yalnızca ilk gönderimde zorunlu; kontrolü servis yapar.
    private Boolean consent;

    public IntakeFormRequest() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Integer heightCm) {
        this.heightCm = heightCm;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getChronicDiseases() {
        return chronicDiseases;
    }

    public void setChronicDiseases(String chronicDiseases) {
        this.chronicDiseases = chronicDiseases;
    }

    public String getSurgeries() {
        return surgeries;
    }

    public void setSurgeries(String surgeries) {
        this.surgeries = surgeries;
    }

    public String getMedications() {
        return medications;
    }

    public void setMedications(String medications) {
        this.medications = medications;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public MainMeals getMainMeals() {
        return mainMeals;
    }

    public void setMainMeals(MainMeals mainMeals) {
        this.mainMeals = mainMeals;
    }

    public Boolean getEatsBreakfast() {
        return eatsBreakfast;
    }

    public void setEatsBreakfast(Boolean eatsBreakfast) {
        this.eatsBreakfast = eatsBreakfast;
    }

    public WaterIntake getWaterIntake() {
        return waterIntake;
    }

    public void setWaterIntake(WaterIntake waterIntake) {
        this.waterIntake = waterIntake;
    }

    public TeaCoffee getTeaCoffee() {
        return teaCoffee;
    }

    public void setTeaCoffee(TeaCoffee teaCoffee) {
        this.teaCoffee = teaCoffee;
    }

    public Boolean getDrinksSoda() {
        return drinksSoda;
    }

    public void setDrinksSoda(Boolean drinksSoda) {
        this.drinksSoda = drinksSoda;
    }

    public String getDislikedFoods() {
        return dislikedFoods;
    }

    public void setDislikedFoods(String dislikedFoods) {
        this.dislikedFoods = dislikedFoods;
    }

    public String getSnacks() {
        return snacks;
    }

    public void setSnacks(String snacks) {
        this.snacks = snacks;
    }

    public String getEatingOut() {
        return eatingOut;
    }

    public void setEatingOut(String eatingOut) {
        this.eatingOut = eatingOut;
    }

    public Goal getGoal() {
        return goal;
    }

    public void setGoal(Goal goal) {
        this.goal = goal;
    }

    public String getGoalOther() {
        return goalOther;
    }

    public void setGoalOther(String goalOther) {
        this.goalOther = goalOther;
    }

    public String getPreviousDiets() {
        return previousDiets;
    }

    public void setPreviousDiets(String previousDiets) {
        this.previousDiets = previousDiets;
    }

    public String getSpecialDiet() {
        return specialDiet;
    }

    public void setSpecialDiet(String specialDiet) {
        this.specialDiet = specialDiet;
    }

    public ProgramStyle getProgramStyle() {
        return programStyle;
    }

    public void setProgramStyle(ProgramStyle programStyle) {
        this.programStyle = programStyle;
    }

    public SleepHours getSleepHours() {
        return sleepHours;
    }

    public void setSleepHours(SleepHours sleepHours) {
        this.sleepHours = sleepHours;
    }

    public EnergyLevel getEnergyLevel() {
        return energyLevel;
    }

    public void setEnergyLevel(EnergyLevel energyLevel) {
        this.energyLevel = energyLevel;
    }

    public Boolean getSmokes() {
        return smokes;
    }

    public void setSmokes(Boolean smokes) {
        this.smokes = smokes;
    }

    public Boolean getDrinksAlcohol() {
        return drinksAlcohol;
    }

    public void setDrinksAlcohol(Boolean drinksAlcohol) {
        this.drinksAlcohol = drinksAlcohol;
    }

    public String getAlcoholFrequency() {
        return alcoholFrequency;
    }

    public void setAlcoholFrequency(String alcoholFrequency) {
        this.alcoholFrequency = alcoholFrequency;
    }

    public ExerciseDays getExerciseDays() {
        return exerciseDays;
    }

    public void setExerciseDays(ExerciseDays exerciseDays) {
        this.exerciseDays = exerciseDays;
    }

    public Boolean getSportCardio() {
        return sportCardio;
    }

    public void setSportCardio(Boolean sportCardio) {
        this.sportCardio = sportCardio;
    }

    public Boolean getSportWeights() {
        return sportWeights;
    }

    public void setSportWeights(Boolean sportWeights) {
        this.sportWeights = sportWeights;
    }

    public Boolean getSportPilatesYoga() {
        return sportPilatesYoga;
    }

    public void setSportPilatesYoga(Boolean sportPilatesYoga) {
        this.sportPilatesYoga = sportPilatesYoga;
    }

    public String getSportOther() {
        return sportOther;
    }

    public void setSportOther(String sportOther) {
        this.sportOther = sportOther;
    }

    public Boolean getTracksSteps() {
        return tracksSteps;
    }

    public void setTracksSteps(Boolean tracksSteps) {
        this.tracksSteps = tracksSteps;
    }

    public Integer getAverageSteps() {
        return averageSteps;
    }

    public void setAverageSteps(Integer averageSteps) {
        this.averageSteps = averageSteps;
    }

    public String getDigestiveProblems() {
        return digestiveProblems;
    }

    public void setDigestiveProblems(String digestiveProblems) {
        this.digestiveProblems = digestiveProblems;
    }

    public String getLactoseGlutenSymptoms() {
        return lactoseGlutenSymptoms;
    }

    public void setLactoseGlutenSymptoms(String lactoseGlutenSymptoms) {
        this.lactoseGlutenSymptoms = lactoseGlutenSymptoms;
    }

    public Boolean getConsent() {
        return consent;
    }

    public void setConsent(Boolean consent) {
        this.consent = consent;
    }
}
