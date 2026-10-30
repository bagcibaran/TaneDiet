// Ekranda düzenlenen öğün. key yalnızca React listesi ve seçim için (kaydedilmez).
export type EditorMeal = {
    key: string
    name: string
    time: string
    items: string
}

// Güne eklenebilecek öğün: hazır öğün ya da boş öğün
export type AddableMeal = {
    name: string
    time: string | null
    items: string
}

// Öğünün dolu madde satırı sayısı (listede ve şeritte gösterilir)
export function itemCount(meal: EditorMeal): number {
    return meal.items.split('\n').filter((line) => line.trim() !== '').length
}
