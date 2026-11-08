import { useTranslation } from 'react-i18next'

type LanguageToggleProps = {
    // dark: yeşil zemin üzerinde (giriş sayfası) · light: beyaz kart üzerinde (kullanıcı menüsü)
    tone?: 'dark' | 'light'
}

// Küçük TR / EN / DE düğmeleri
function LanguageToggle({ tone = 'dark' }: LanguageToggleProps) {
    const { i18n } = useTranslation()
    const currentLanguage = (i18n.resolvedLanguage ?? i18n.language ?? 'tr').slice(0, 2)

    const activeClass = tone === 'dark' ? 'bg-cream text-brand' : 'bg-brand text-cream'
    const idleClass = tone === 'dark' ? 'text-mint hover:text-cream' : 'text-muted hover:text-brand'

    return (
        <div className="flex gap-1 text-sm font-semibold">
            {['tr', 'en', 'de'].map((code) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => i18n.changeLanguage(code)}
                    className={`rounded-full px-2.5 py-1 uppercase ${currentLanguage === code ? activeClass : idleClass}`}
                >
                    {code}
                </button>
            ))}
        </div>
    )
}

export default LanguageToggle
