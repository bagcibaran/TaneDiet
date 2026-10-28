import type {
    DietLibrary,
    MealTemplate,
    MealTemplateRequest,
    QuickPickCategory,
    QuickPickItem,
} from '../types/dietLibrary'
import { apiRequest } from './apiClient'

// Diyetisyen: hazır öğünler ve hızlı maddeler (ilk açılışta örnekler bir kez yüklenir)
export function getDietLibrary(): Promise<DietLibrary> {
    return apiRequest<DietLibrary>('/diet-library')
}

// ---------- Hazır öğünler ----------

export function createMealTemplate(request: MealTemplateRequest): Promise<MealTemplate> {
    return apiRequest<MealTemplate>('/diet-library/meals', { method: 'POST', body: request })
}

export function updateMealTemplate(id: number, request: MealTemplateRequest): Promise<MealTemplate> {
    return apiRequest<MealTemplate>(`/diet-library/meals/${id}`, { method: 'PUT', body: request })
}

export function deleteMealTemplate(id: number): Promise<void> {
    return apiRequest<void>(`/diet-library/meals/${id}`, { method: 'DELETE' })
}

// ---------- Kategoriler ----------

export function createQuickCategory(name: string): Promise<QuickPickCategory> {
    return apiRequest<QuickPickCategory>('/diet-library/categories', { method: 'POST', body: { name } })
}

export function renameQuickCategory(id: number, name: string): Promise<QuickPickCategory> {
    return apiRequest<QuickPickCategory>(`/diet-library/categories/${id}`, { method: 'PUT', body: { name } })
}

export function deleteQuickCategory(id: number): Promise<void> {
    return apiRequest<void>(`/diet-library/categories/${id}`, { method: 'DELETE' })
}

// ---------- Maddeler ----------

export function addQuickItem(categoryId: number, text: string): Promise<QuickPickItem> {
    return apiRequest<QuickPickItem>(`/diet-library/categories/${categoryId}/items`, { method: 'POST', body: { text } })
}

export function updateQuickItem(id: number, text: string): Promise<QuickPickItem> {
    return apiRequest<QuickPickItem>(`/diet-library/items/${id}`, { method: 'PUT', body: { text } })
}

export function deleteQuickItem(id: number): Promise<void> {
    return apiRequest<void>(`/diet-library/items/${id}`, { method: 'DELETE' })
}
