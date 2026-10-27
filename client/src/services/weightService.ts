import { apiRequest } from './apiClient'
import type { CreateWeightEntryRequest, WeightEntry, WeightSummary } from '../types/weight'

export function getMyWeights(): Promise<WeightEntry[]> {
    return apiRequest<WeightEntry[]>('/weights')
}

export function addMyWeight(request: CreateWeightEntryRequest): Promise<WeightEntry> {
    return apiRequest<WeightEntry>('/weights', {
        method: 'POST',
        body: request,
    })
}

export function getClientWeights(clientId: number): Promise<WeightEntry[]> {
    return apiRequest<WeightEntry[]>(`/clients/${clientId}/weights`)
}

export function addClientWeight(
    clientId: number,
    request: CreateWeightEntryRequest,
): Promise<WeightEntry> {
    return apiRequest<WeightEntry>(`/clients/${clientId}/weights`, {
        method: 'POST',
        body: request,
    })
}

export function deleteMyWeight(entryId: number): Promise<void> {
    return apiRequest<void>(`/weights/${entryId}`, { method: 'DELETE' })
}

export function deleteClientWeight(clientId: number, entryId: number): Promise<void> {
    return apiRequest<void>(`/clients/${clientId}/weights/${entryId}`, { method: 'DELETE' })
}

export function getMyWeightSummary(): Promise<WeightSummary> {
    return apiRequest<WeightSummary>('/weights/summary')
}

export function getClientWeightSummary(clientId: number): Promise<WeightSummary> {
    return apiRequest<WeightSummary>(`/clients/${clientId}/weights/summary`)
}