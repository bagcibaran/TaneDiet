package com.project.project.dto;

import com.project.project.entity.IntakeForm;
import com.project.project.entity.IntakeOptions.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

// Ön görüşme formunun cevabı (danışan ve diyetisyen aynı şekli görür)
public class IntakeFormResponse {

    private final String fullName;
    private final LocalDate birthDate;
    private final Gender gender;
    private final Integer heightCm;
    private final BigDecimal weightKg;
    private final String occupation;
    private final String chronicDiseases;
    private final String surgeries;
    private final String medications;
    private final String allergies;
    private final MainMeals mainMeals;
    private final boolean eatsBreakfast;
    private final WaterIntake waterIntake;
    private final TeaCoffee teaCoffee;
    private final boolean drinksSoda;
    private final String dislikedFoods;
    private final String snacks;
    private final String eatingOut;
    private final Goal goal;
    private final String goalOther;
    private final String previousDiets;
    private final String specialDiet;
    private final ProgramStyle programStyle;
    private final SleepHours sleepHours;
    private final EnergyLevel energyLevel;
    private final boolean smokes;
    private final boolean drinksAlcohol;
    private final String alcoholFrequency;
    private final ExerciseDays exerciseDays;
    private final boolean sportCardio;
    private final boolean sportWeights;
    private final boolean sportPilatesYoga;
    private final String sportOther;
    private final boolean tracksSteps;
    private final Integer averageSteps;
    private final String digestiveProblems;
    private final String lactoseGlutenSymptoms;

    private final int age;
    private final LocalDateTime consentGivenAt;
    private final LocalDateTime updatedAt;

    public IntakeFormResponse(IntakeForm form) {
        this.fullName = form.getFullName();
        this.birthDate = form.getBirthDate();
        this.gender = form.getGender();
        this.heightCm = form.getHeightCm();
        this.weightKg = form.getWeightKg();
        this.occupation = form.getOccupation();
        this.chronicDiseases = form.getChronicDiseases();
        this.surgeries = form.getSurgeries();
        this.medications = form.getMedications();
        this.allergies = form.getAllergies();
        this.mainMeals = form.getMainMeals();
        this.eatsBreakfast = form.isEatsBreakfast();
        this.waterIntake = form.getWaterIntake();
        this.teaCoffee = form.getTeaCoffee();
        this.drinksSoda = form.isDrinksSoda();
        this.dislikedFoods = form.getDislikedFoods();
        this.snacks = form.getSnacks();
        this.eatingOut = form.getEatingOut();
        this.goal = form.getGoal();
        this.goalOther = form.getGoalOther();
        this.previousDiets = form.getPreviousDiets();
        this.specialDiet = form.getSpecialDiet();
        this.programStyle = form.getProgramStyle();
        this.sleepHours = form.getSleepHours();
        this.energyLevel = form.getEnergyLevel();
        this.smokes = form.isSmokes();
        this.drinksAlcohol = form.isDrinksAlcohol();
        this.alcoholFrequency = form.getAlcoholFrequency();
        this.exerciseDays = form.getExerciseDays();
        this.sportCardio = form.isSportCardio();
        this.sportWeights = form.isSportWeights();
        this.sportPilatesYoga = form.isSportPilatesYoga();
        this.sportOther = form.getSportOther();
        this.tracksSteps = form.isTracksSteps();
        this.averageSteps = form.getAverageSteps();
        this.digestiveProblems = form.getDigestiveProblems();
        this.lactoseGlutenSymptoms = form.getLactoseGlutenSymptoms();

        // Yaş sorulmuyor, doğum tarihinden hesaplanıyor
        this.age = Period.between(form.getBirthDate(), LocalDate.now()).getYears();
        this.consentGivenAt = form.getConsentGivenAt();
        this.updatedAt = form.getUpdatedAt();
    }

    public String getFullName() {
        return fullName;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public Gender getGender() {
        return gender;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public String getOccupation() {
        return occupation;
    }

    public String getChronicDiseases() {
        return chronicDiseases;
    }

    public String getSurgeries() {
        return surgeries;
    }

    public String getMedications() {
        return medications;
    }

    public String getAllergies() {
        return allergies;
    }

    public MainMeals getMainMeals() {
        return mainMeals;
    }

    public boolean isEatsBreakfast() {
        return eatsBreakfast;
    }

    public WaterIntake getWaterIntake() {
        return waterIntake;
    }

    public TeaCoffee getTeaCoffee() {
        return teaCoffee;
    }

    public boolean isDrinksSoda() {
        return drinksSoda;
    }

    public String getDislikedFoods() {
        return dislikedFoods;
    }

    public String getSnacks() {
        return snacks;
    }

    public String getEatingOut() {
        return eatingOut;
    }

    public Goal getGoal() {
        return goal;
    }

    public String getGoalOther() {
        return goalOther;
    }

    public String getPreviousDiets() {
        return previousDiets;
    }

    public String getSpecialDiet() {
        return specialDiet;
    }

    public ProgramStyle getProgramStyle() {
        return programStyle;
    }

    public SleepHours getSleepHours() {
        return sleepHours;
    }

    public EnergyLevel getEnergyLevel() {
        return energyLevel;
    }

    public boolean isSmokes() {
        return smokes;
    }

    public boolean isDrinksAlcohol() {
        return drinksAlcohol;
    }

    public String getAlcoholFrequency() {
        return alcoholFrequency;
    }

    public ExerciseDays getExerciseDays() {
        return exerciseDays;
    }

    public boolean isSportCardio() {
        return sportCardio;
    }

    public boolean isSportWeights() {
        return sportWeights;
    }

    public boolean isSportPilatesYoga() {
        return sportPilatesYoga;
    }

    public String getSportOther() {
        return sportOther;
    }

    public boolean isTracksSteps() {
        return tracksSteps;
    }

    public Integer getAverageSteps() {
        return averageSteps;
    }

    public String getDigestiveProblems() {
        return digestiveProblems;
    }

    public String getLactoseGlutenSymptoms() {
        return lactoseGlutenSymptoms;
    }

    public int getAge() {
        return age;
    }

    public LocalDateTime getConsentGivenAt() {
        return consentGivenAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
