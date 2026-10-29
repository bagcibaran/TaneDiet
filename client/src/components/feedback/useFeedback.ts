import { useContext } from 'react'

import { FeedbackContext, type FeedbackApi } from './feedbackContext'

// Bildirim ve onay penceresi: const { toast, confirm } = useFeedback()
export function useFeedback(): FeedbackApi {
    const api = useContext(FeedbackContext)
    if (!api) {
        throw new Error('useFeedback FeedbackProvider içinde kullanılmalı')
    }
    return api
}
