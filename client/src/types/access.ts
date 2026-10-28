// Danışanın hizmet süresi. Backend: ClientAccessRequest / ClientAccessResponse.

export type ClientAccess = {
    // Son gün (dahil), "2026-11-28"; null = süresiz
    accessUntil: string | null
    locked: boolean
    // Kalan gün (son gün 0); süresiz veya kilitliyse null
    daysLeft: number | null
}

// ADD_MONTHS: paket ekle · SET_DATE: bitiş tarihini ayarla · UNLIMITED: süresiz yap · CLOSE_NOW: erişimi hemen kapat
export type ClientAccessRequest =
    | { action: 'ADD_MONTHS'; months: number }
    | { action: 'SET_DATE'; date: string }
    | { action: 'UNLIMITED' }
    | { action: 'CLOSE_NOW' }

// Satılan paket süreleri (ay)
export const PACKAGE_MONTHS = [1, 3, 6] as const
