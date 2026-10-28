import type { DietMeal } from '../types/diet'

// Haftanın günleri: 1 = Pazartesi … 7 = Pazar (backend'deki dayIndex ile aynı)
export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const

// Telefonun tarihine göre bugünün dayIndex'i (JavaScript'te Pazar = 0)
export function todayIndex(): number {
    const day = new Date().getDay()
    return day === 0 ? 7 : day
}

// Bir günün öğünleri, sıralı. Günlük programda her gün 0 numaralı listedir.
export function mealsOfDay(meals: DietMeal[], dayIndex: number): DietMeal[] {
    return meals.filter((meal) => meal.dayIndex === dayIndex).sort((a, b) => a.position - b.position)
}

// "120 gr et / 150 gr tavuk / 8 YK sebze" → ["120 gr et", "150 gr tavuk", "8 YK sebze"]
// Yalnızca boşluklu " / " ve " veya " ayırır; "1/2 elma" bölünmez.
export function splitAlternatives(line: string): string[] {
    return line
        .split(/\s+\/\s+|\s+veya\s+/i)
        .map((part) => part.trim())
        .filter((part) => part !== '')
}

// "yumurta\n\nekmek" → ["yumurta", "ekmek"]
export function itemLines(items: string): string[] {
    return items
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '')
}
