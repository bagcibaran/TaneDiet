// Backend: WeightEntryResponse
export type WeightEntry = {
    id: number
    weightKg: number
    measuredOn: string
    enteredBy: string
    createdAt: string
}

// Backend: WeightEntryCreateRequest
export type CreateWeightEntryRequest = {
    weightKg: number
    measuredOn: string
}