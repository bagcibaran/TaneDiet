import i18n, { type TFunction } from 'i18next'
import { ApiError } from './apiClient'
import serverErrors from '../i18n/serverErrors.json'

type Translation = { en: string; de: string }

const SERVER_ERRORS = serverErrors as Record<string, Translation>

// Ön ek anahtarlar ("Danışan bulunamadı, id: " gibi), uzundan kısaya: en uzun eşleşme kazanır
const PREFIX_KEYS = Object.keys(SERVER_ERRORS)
    .filter((key) => key.endsWith(' '))
    .sort((a, b) => b.length - a.length)

// Sunucu mesajları Türkçe gelir; seçili dil Türkçe değilse serverErrors.json'daki çeviri gösterilir.
// Sonu değişken mesajlarda (id, ad) çevrilen ön ekin arkasına değişken kısım eklenir. Bilinmeyen mesaj olduğu gibi kalır.
export function translateServerMessage(message: string, language: string): string {
    const code = language.slice(0, 2)
    if (code !== 'en' && code !== 'de') {
        return message
    }
    const exact = SERVER_ERRORS[message]
    if (exact) {
        return exact[code]
    }
    const prefix = PREFIX_KEYS.find((key) => message.startsWith(key))
    return prefix ? SERVER_ERRORS[prefix][code] + message.slice(prefix.length) : message
}

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
            return error.message ? translateServerMessage(error.message, i18n.language ?? 'tr') : t(fallbackKey)
    }
}
