import { createContext } from 'react'

export type ConfirmOptions = {
    title: string
    message?: string
    confirmLabel: string
    // Silme / kapatma gibi geri alınamaz işlemler kırmızı düğmeyle sorulur
    danger?: boolean
}

export type ToastTone = 'success' | 'error'

export type FeedbackApi = {
    // Kısa bildirim ("Kaydedildi"); birkaç saniye sonra kendiliğinden kaybolur
    toast: (message: string, tone?: ToastTone) => void
    // Markalı onay penceresi; kullanıcı onaylarsa true döner
    confirm: (options: ConfirmOptions) => Promise<boolean>
}

export const FeedbackContext = createContext<FeedbackApi | null>(null)
