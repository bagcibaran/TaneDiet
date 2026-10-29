import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type LogoProps = {
    // 'light': yeşil zemin üzerinde krem yazı (başlık alanı)
    // 'dark': krem zemin üzerinde yeşil yazı
    tone?: 'light' | 'dark'
    size?: 'md' | 'lg'
    showTagline?: boolean
    // Verilirse logo tıklanabilir: o adrese götürür (ör. ana sayfa)
    to?: string
}

function Logo({ tone = 'light', size = 'md', showTagline = true, to }: LogoProps) {
    const { t } = useTranslation()

    const wordColor = tone === 'light' ? 'text-cream' : 'text-brand'
    const taglineColor = tone === 'light' ? 'text-mint' : 'text-muted'
    const wordSize = size === 'lg' ? 'text-5xl' : 'text-3xl'

    const content = (
        <>
            {/* Marka adı çevrilmez. Harf aralığı CSS ile: ekranda "t a n e." görünür, metin "tane." kalır */}
            <span className={`font-extrabold tracking-[0.25em] ${wordSize} ${wordColor}`}>
                tane.
            </span>
            {showTagline && (
                <span className={`mt-1 block text-[0.6rem] font-semibold uppercase tracking-[0.35em] ${taglineColor}`}>
                    {t('brand.tagline')}
                </span>
            )}
        </>
    )

    if (to) {
        return (
            <Link
                to={to}
                aria-label={t('brand.home')}
                className="inline-block rounded-xl leading-none transition hover:opacity-85 active:scale-[0.98]"
            >
                {content}
            </Link>
        )
    }

    return <div className="inline-block leading-none">{content}</div>
}

export default Logo
