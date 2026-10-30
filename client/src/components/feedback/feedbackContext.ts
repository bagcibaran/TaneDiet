import { createContext } from 'react'

export type ConfirmOptions = {
    title: string
    message?: string
    confirmLabel: string
    // Silme / kapatma gibi geri alınamaz işlemler kırmızı düğmeyle sorulur
    danger?: boolean
    // Verilirse onay düğmesi, kullanıcı bu metni aynen yazana kadar kapalı kalır (ör. kalıcı silmede kullanıcı adı)
    requireText?: string
}

export type ToastTone = 'success' | 'error'

// Bildirimdeki düğme (ör. "Geri al"); verilirse bildirim daha uzun kalır
export type ToastAction = {
    label: string
    onClick: () => void
}

export type FeedbackApi = {
    // Kısa bildirim ("Kaydedildi"); birkaç saniye sonra kendiliğinden kaybolur
    toast: (message: string, tone?: ToastTone, action?: ToastAction) => void
    // Markalı onay penceresi; kullanıcı onaylarsa true döner
    confirm: (options: ConfirmOptions) => Promise<boolean>
}

export const FeedbackContext = createContext<FeedbackApi | null>(null)
