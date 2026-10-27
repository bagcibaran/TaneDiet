import { useTranslation } from 'react-i18next'

// Yeşil zemin üzerinde küçük TR / EN düğmeleri (giriş sayfası ve profil başlığında)
function LanguageToggle() {
    const { i18n } = useTranslation()
    const currentLanguage = i18n.language.startsWith('tr') ? 'tr' : 'en'

    return (
        <div className="flex gap-1 text-sm font-semibold">
            {['tr', 'en'].map((code) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => i18n.changeLanguage(code)}
                    className={`rounded-full px-3 py-1 uppercase ${
                        currentLanguage === code ? 'bg-cream text-brand' : 'text-mint hover:text-cream'
                    }`}
                >
                    {code}
                </button>
            ))}
        </div>
    )
}

export default LanguageToggle