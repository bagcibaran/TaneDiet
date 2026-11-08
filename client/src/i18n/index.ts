import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import tr from './locales/tr.json'
import en from './locales/en.json'
import de from './locales/de.json'

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            tr: { translation: tr },
            en: { translation: en },
            de: { translation: de },
        },
        fallbackLng: 'tr',
        supportedLngs: ['tr', 'en', 'de'],
        // Bölgeli diller ana dile iner: de-AT, de-DE → de; en-GB → en
        nonExplicitSupportedLngs: true,
        load: 'languageOnly',
        interpolation: {
            escapeValue: false,
        },
    })

// <html lang> seçili dili izler: ekran okuyucular doğru dilde okur, büyük harf dönüşümü doğru olur (İngilizcede "DIET", "DİET" değil)
const syncHtmlLang = (language: string | undefined) => {
    document.documentElement.lang = (language ?? 'tr').slice(0, 2)
}
syncHtmlLang(i18n.resolvedLanguage)
i18n.on('languageChanged', syncHtmlLang)

export default i18n