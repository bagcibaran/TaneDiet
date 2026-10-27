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