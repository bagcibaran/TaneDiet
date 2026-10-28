// Ön görüşme formu tipleri. Backend: IntakeFormRequest / IntakeFormResponse, IntakeOptions enum'ları.

export type Gender = 'FEMALE' | 'MALE'
export type MainMeals = 'TWO' | 'THREE' | 'FOUR_PLUS'
export type WaterIntake = 'HALF_LITER' | 'ONE_LITER' | 'ONE_AND_HALF_LITER' | 'TWO_LITERS_PLUS'
export type TeaCoffee = 'NONE' | 'TWO_CUPS' | 'THREE_CUPS_PLUS'
export type Goal = 'LOSE_WEIGHT' | 'GAIN_WEIGHT' | 'MAINTAIN_WEIGHT' | 'HEALTHY_HABITS' | 'OTHER'
export type ProgramStyle = 'STRICT' | 'FLEXIBLE' | 'CONSCIOUS_CHOICES'
export type SleepHours = 'UNDER_4' | 'FROM_4_TO_6' | 'FROM_6_TO_8' | 'OVER_8'
export type EnergyLevel = 'ENERGETIC' | 'MODERATELY_TIRED' | 'ALWAYS_TIRED'
export type ExerciseDays = 'NONE' | 'ONE_TO_TWO' | 'THREE_TO_FOUR' | 'FIVE_PLUS'

// Danışanın gönderdiği form (tarihler "YYYY-MM-DD")
export type IntakeFormRequest = {
    // 1. Kişisel bilgiler
    fullName: string
    birthDate: string
    gender: Gender
    heightCm: number
    weightKg: number
    occupation: string
    // 2. Sağlık geçmişi
    chronicDiseases: string | null
    surgeries: string | null
    medications: string | null
    allergies: string | null
    // 3. Beslenme alışkanlıkları
    mainMeals: MainMeals
    eatsBreakfast: boolean
    waterIntake: WaterIntake
    teaCoffee: TeaCoffee
    drinksSoda: boolean
    dislikedFoods: string | null
    snacks: string | null
    eatingOut: string | null
    // 4. Hedef ve beklentiler
    goal: Goal
    goalOther: string | null
    previousDiets: string | null
    specialDiet: string | null
    programStyle: ProgramStyle
    // 5. Yaşam tarzı
    sleepHours: SleepHours
    energyLevel: EnergyLevel
    smokes: boolean
    drinksAlcohol: boolean
    alcoholFrequency: string | null
    // 6. Spor ve hareketlilik
    exerciseDays: ExerciseDays
    sportCardio: boolean
    sportWeights: boolean
    sportPilatesYoga: boolean
    sportOther: string | null
    tracksSteps: boolean
    averageSteps: number | null
    // 7. Mide ve bağırsak sağlığı
    digestiveProblems: string | null
    lactoseGlutenSymptoms: string | null
    // Açık rıza: yalnızca ilk gönderimde gerekli
    consent?: boolean
}

// Backend'den gelen form: istek alanları + sunucunun hesapladıkları
export type IntakeForm = Omit<IntakeFormRequest, 'consent'> & {
    age: number
    consentGivenAt: string
    updatedAt: string
}
