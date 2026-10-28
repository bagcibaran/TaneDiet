// Diyetisyenin danışan listesi ve bildirimleri. Backend: ClientOverviewResponse, ClientActivityResponse.

// MISSING: form yok · NEW: form yeni dolduruldu · UPDATED: bazı sorular değişti · SEEN: yeni bir şey yok
export type IntakeStatus = 'MISSING' | 'NEW' | 'UPDATED' | 'SEEN'

export type ClientOverview = {
    id: number
    username: string
    email: string
    // Diyetisyen son baktığından beri danışanın kendi girdiği kilo kaydı sayısı
    newWeightCount: number
    intakeStatus: IntakeStatus
}

export type ClientActivity = {
    newWeightEntryIds: number[]
    intakeStatus: IntakeStatus
    // Değişen form soruları (alan adları, ör. "medications")
    changedFields: string[]
}
