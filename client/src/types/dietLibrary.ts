// Diyetisyenin hazır öğünleri ve hızlı maddeleri ("Hazırlar"). Backend: DietLibraryResponse ve istekleri.

export type MealTemplate = {
    id: number
    name: string
    // "09:00" ya da saatsiz
    time: string | null
    // Her satır bir madde; boş olabilir (o zaman yalnızca ad ve saat eklenir)
    items: string
}

export type QuickPickItem = {
    id: number
    text: string
}

export type QuickPickCategory = {
    id: number
    name: string
    items: QuickPickItem[]
}

export type DietLibrary = {
    // Saate göre sıralı, saatsizler sonda
    meals: MealTemplate[]
    categories: QuickPickCategory[]
}

export type MealTemplateRequest = {
    name: string
    time: string | null
    items: string
}
