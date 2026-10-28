package com.project.project.entity;

import com.project.project.entity.IntakeOptions.*;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

// Danışanın ön görüşme formu. Her danışanın en fazla bir formu var (tabloda UNIQUE user_id).
@Entity
@Table(name = "intake_form")
public class IntakeForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 1. Kişisel bilgiler
    private String fullName;
    private LocalDate birthDate;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    private Integer heightCm;
    @Column(precision = 5, scale = 2)
    private BigDecimal weightKg;
    private String occupation;

    // 2. Sağlık geçmişi
    @Column(columnDefinition = "TEXT")
    private String chronicDiseases;
    @Column(columnDefinition = "TEXT")
    private String surgeries;
    @Column(columnDefinition = "TEXT")
    private String medications;
    @Column(columnDefinition = "TEXT")
    private String allergies;

    // 3. Beslenme alışkanlıkları
    @Enumerated(EnumType.STRING)
    private MainMeals mainMeals;
    private boolean eatsBreakfast;
    @Enumerated(EnumType.STRING)
    private WaterIntake waterIntake;
    @Enumerated(EnumType.STRING)
    private TeaCoffee teaCoffee;
    private boolean drinksSoda;
    @Column(columnDefinition = "TEXT")
    private String dislikedFoods;
    @Column(columnDefinition = "TEXT")
    private String snacks;
    @Column(columnDefinition = "TEXT")
    private String eatingOut;

    // 4. Hedef ve beklentiler
    @Enumerated(EnumType.STRING)
    private Goal goal;
    private String goalOther;
    @Column(columnDefinition = "TEXT")
    private String previousDiets;
    @Column(columnDefinition = "TEXT")
    private String specialDiet;
    @Enumerated(EnumType.STRING)
    private ProgramStyle programStyle;

    // 5. Yaşam tarzı
    @Enumerated(EnumType.STRING)
    private SleepHours sleepHours;
    @Enumerated(EnumType.STRING)
    private EnergyLevel energyLevel;
    private boolean smokes;
    private boolean drinksAlcohol;
    private String alcoholFrequency;

    // 6. Spor ve hareketlilik
    @Enumerated(EnumType.STRING)
    private ExerciseDays exerciseDays;
    private boolean sportCardio;
    private boolean sportWeights;
    private boolean sportPilatesYoga;
    private String sportOther;
    private boolean tracksSteps;
    private Integer averageSteps;

    // 7. Mide ve bağırsak sağlığı
    @Column(columnDefinition = "TEXT")
    private String digestiveProblems;
    @Column(columnDefinition = "TEXT")
    private String lactoseGlutenSymptoms;

    // Sunucunun doldurduğu alanlar
    private LocalDateTime consentGivenAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public IntakeForm() {
    }

    public IntakeForm(User user) {
        this.user = user;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    // Form her güncellendiğinde "son güncelleme" zamanını yeniler
    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
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

    public boolean isEatsBreakfast() {
        return eatsBreakfast;
    }

    public void setEatsBreakfast(boolean eatsBreakfast) {
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

    public boolean isDrinksSoda() {
        return drinksSoda;
    }

    public void setDrinksSoda(boolean drinksSoda) {
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

    public boolean isSmokes() {
        return smokes;
    }

    public void setSmokes(boolean smokes) {
        this.smokes = smokes;
    }

    public boolean isDrinksAlcohol() {
        return drinksAlcohol;
    }

    public void setDrinksAlcohol(boolean drinksAlcohol) {
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

    public boolean isSportCardio() {
        return sportCardio;
    }

    public void setSportCardio(boolean sportCardio) {
        this.sportCardio = sportCardio;
    }

    public boolean isSportWeights() {
        return sportWeights;
    }

    public void setSportWeights(boolean sportWeights) {
        this.sportWeights = sportWeights;
    }

    public boolean isSportPilatesYoga() {
        return sportPilatesYoga;
    }

    public void setSportPilatesYoga(boolean sportPilatesYoga) {
        this.sportPilatesYoga = sportPilatesYoga;
    }

    public String getSportOther() {
        return sportOther;
    }

    public void setSportOther(String sportOther) {
        this.sportOther = sportOther;
    }

    public boolean isTracksSteps() {
        return tracksSteps;
    }

    public void setTracksSteps(boolean tracksSteps) {
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

    public LocalDateTime getConsentGivenAt() {
        return consentGivenAt;
    }

    public void setConsentGivenAt(LocalDateTime consentGivenAt) {
        this.consentGivenAt = consentGivenAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
