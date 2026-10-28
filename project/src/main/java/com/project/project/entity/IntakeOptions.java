package com.project.project.entity;

// Ön görüşme formundaki seçmeli soruların cevapları.
// Değerler V4 migration'ındaki ENUM sütunlarıyla birebir aynı olmalı.
public final class IntakeOptions {

    private IntakeOptions() {
    }

    public enum Gender { FEMALE, MALE }

    public enum MainMeals { TWO, THREE, FOUR_PLUS }

    public enum WaterIntake { HALF_LITER, ONE_LITER, ONE_AND_HALF_LITER, TWO_LITERS_PLUS }

    public enum TeaCoffee { NONE, TWO_CUPS, THREE_CUPS_PLUS }

    public enum Goal { LOSE_WEIGHT, GAIN_WEIGHT, MAINTAIN_WEIGHT, HEALTHY_HABITS, OTHER }

    public enum ProgramStyle { STRICT, FLEXIBLE, CONSCIOUS_CHOICES }

    public enum SleepHours { UNDER_4, FROM_4_TO_6, FROM_6_TO_8, OVER_8 }

    public enum EnergyLevel { ENERGETIC, MODERATELY_TIRED, ALWAYS_TIRED }

    public enum ExerciseDays { NONE, ONE_TO_TWO, THREE_TO_FOUR, FIVE_PLUS }
}
