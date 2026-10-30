import { apiRequest } from './apiClient'
import type { LegalText } from '../types/legal'

// Aydınlatma metni (herkese açık)
export function getPrivacyText(): Promise<LegalText> {
    return apiRequest<LegalText>('/legal/privacy')
}

// Açık rıza metni (herkese açık)
export function getConsentText(): Promise<LegalText> {
    return apiRequest<LegalText>('/legal/consent')
}

// Danışan gördüğü sürümü onaylar. Metin bu arada değiştiyse backend 409 döner.
export function acceptConsent(version: string): Promise<void> {
    return apiRequest<void>('/consent', { method: 'POST', body: { version } })
}
