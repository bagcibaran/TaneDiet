import type { TFunction } from 'i18next'
import { ApiError } from './apiClient'

// Bir hatayı kullanıcıya gösterilecek metne çevirir.
// fallbackKey: backend açıklama göndermediğinde kullanılacak i18n anahtarı.
export function toErrorMessage(
    error: unknown,
    t: TFunction,
    fallbackKey: string,
): string {
    if (!(error instanceof ApiError)) {
        return t(fallbackKey)
    }

    switch (error.status) {
        case 0:
            return t('errors.network')
        case 401:
            return t('errors.sessionExpired')
        case 403:
            return t('errors.forbidden')
        default:
            return error.message || t(fallbackKey)
    }
}
