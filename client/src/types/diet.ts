// Diyet programı tipleri. Backend: DietPlanRequest / DietPlanResponse.

export type PlanType = 'DAILY' | 'WEEKLY'

// dayIndex: 0 = her gün (günlük program), 1-7 = Pazartesi-Pazar (haftalık program)
export type DietMeal = {
    dayIndex: number
    position: number
    name: string
    time: string | null
    // Her satır bir madde; satır içindeki seçenekler " / " ile ayrılır
    items: string
}

export type DietPlan = {
    id: number
    planType: PlanType
    title: string
    startDate: string
    notes: string | null
    createdBy: string
    createdAt: string
    updatedAt: string
    meals: DietMeal[]
}

export type DietPlanRequest = {
    planType: PlanType
    title: string
    startDate: string
    notes: string | null
    meals: { dayIndex: number; name: string; time: string | null; items: string }[]
}
