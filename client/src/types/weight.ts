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

// Backend: WeightPointResponse
export type WeightPoint = {
    date: string
    weightKg: number
}

// Backend: WeightSummaryResponse. Hesaplanamayan değerler null gelir.
export type WeightSummary = {
    startWeightKg: number | null
    latestWeightKg: number | null
    changeSinceStartKg: number | null
    changeLast7DaysKg: number | null
    changeLast30DaysKg: number | null
    points: WeightPoint[]
}