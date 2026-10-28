import type { DietPlan, DietPlanRequest } from '../types/diet'
import { apiRequest } from './apiClient'

// Danışan: aktif program (yoksa undefined, backend 204)
export function getMyDietPlan(): Promise<DietPlan | undefined> {
    return apiRequest<DietPlan | undefined>('/diet-plan')
}

// Diyetisyen: danışanın programları, en yeni önce (ilki aktif)
export function getClientDietPlans(clientId: number): Promise<DietPlan[]> {
    return apiRequest<DietPlan[]>(`/clients/${clientId}/diet-plans`)
}

export function createDietPlan(clientId: number, request: DietPlanRequest): Promise<DietPlan> {
    return apiRequest<DietPlan>(`/clients/${clientId}/diet-plans`, { method: 'POST', body: request })
}

export function updateDietPlan(clientId: number, planId: number, request: DietPlanRequest): Promise<DietPlan> {
    return apiRequest<DietPlan>(`/clients/${clientId}/diet-plans/${planId}`, { method: 'PUT', body: request })
}

export function deleteDietPlan(clientId: number, planId: number): Promise<void> {
    return apiRequest<void>(`/clients/${clientId}/diet-plans/${planId}`, { method: 'DELETE' })
}
