import type { CreateWeightEntryRequest, WeightEntry } from '../types/weight'
import { apiRequest } from './apiClient'

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