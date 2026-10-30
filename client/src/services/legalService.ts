import { apiRequest } from './apiClient'
import type { LegalText } from '../types/legal'

// Dil kodu: "en-US" → "en"
const langParam = (language: string) => encodeURIComponent(language.slice(0, 2))

// Aydınlatma metni (herkese açık). Çevirisi bilgi amaçlıdır; bağlayıcı olan Türkçe metindir.
export function getPrivacyText(language: string): Promise<LegalText> {
    return apiRequest<LegalText>(`/legal/privacy?lang=${langParam(language)}`)
}

// Açık rıza metni (herkese açık). Onaylanan sürüm her dilde aynıdır.
export function getConsentText(language: string): Promise<LegalText> {
    return apiRequest<LegalText>(`/legal/consent?lang=${langParam(language)}`)
}

// Danışan gördüğü sürümü onaylar. Metin bu arada değiştiyse backend 409 döner.
export function acceptConsent(version: string): Promise<void> {
    return apiRequest<void>('/consent', { method: 'POST', body: { version } })
}
