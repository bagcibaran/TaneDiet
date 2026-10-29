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

// Aynı öğün mü? Ad (boşluklar kırpılıp büyük/küçük harf farkı olmadan, Türkçe İ/ı) ve saat aynıysa evet.
// Saatsiz öğün yalnızca saatsiz öğünle eşleşir. "Hazır öğün yap" ve "Tüm günlere ekle" bunu kullanır.
export function isSameMeal(a: { name: string; time: string | null }, b: { name: string; time: string | null }): boolean {
    const normalizeName = (name: string) => name.trim().toLocaleLowerCase('tr')
    const normalizeTime = (time: string | null) => (time ?? '').trim()
    return normalizeName(a.name) === normalizeName(b.name) && normalizeTime(a.time) === normalizeTime(b.time)
}

// Menü listelerinde öğünlerin renkli noktaları (sırayla tekrar eder): ana sayfa ve gün menüsü aynı renkleri kullanır
export const MEAL_DOT_COLORS = ['bg-honey', 'bg-coral', 'bg-brand', 'bg-brand-light'] as const

// Hazır öğünler saate göre, saatsizler sonda (backend ile aynı sıra)
export function sortTemplates<T extends { id: number; time: string | null }>(meals: T[]): T[] {
    return [...meals].sort((a, b) => {
        if (a.time === b.time) {
            return a.id - b.id
        }
        if (a.time === null) {
            return 1
        }
        if (b.time === null) {
            return -1
        }
        return a.time.localeCompare(b.time)
    })
}
