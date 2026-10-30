import { useTranslation } from 'react-i18next'

import { DIETITIAN } from '../../landing/content'

// Fotoğraf yokken gösterilen YER TUTUCU çizim (gerçek bir kişinin fotoğrafı değil)
function PlaceholderFigure() {
    return (
        <svg viewBox="0 0 64 64" className="h-full w-full" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <path d="M10 64c2-15 11-21 22-21s20 6 22 21z" fill="var(--color-brand)" />
            <circle cx="32" cy="28" r="12" fill="#f2c9a0" />
            <path d="M19 30c-2-12 5-19 13-19s15 6 13 19c-2-6-6-10-13-10s-11 4-13 10z" fill="#5a3825" />
        </svg>
    )
}

// Diyetisyenin fotoğrafı ya da (DIETITIAN.photo boşken) yer tutucu çizim. Fotoğraf yalnızca landing/content.ts'te ayarlanır.
function DietitianPicture() {
    const { t } = useTranslation()
    if (DIETITIAN.photo) {
        return (
            <img
                src={DIETITIAN.photo}
                alt={t('landing.dietitianPhotoAlt', { name: DIETITIAN.name })}
                className="h-full w-full object-cover object-top"
            />
        )
    }
    return <PlaceholderFigure />
}

type DietitianAvatarProps = {
    size?: number
}

// Küçük yuvarlak diyetisyen resmi ("Hakkımda" kartı)
function DietitianAvatar({ size = 64 }: DietitianAvatarProps) {
    return (
        <span
            className="inline-block shrink-0 animate-pop overflow-hidden rounded-full border-[3px] border-honey bg-sage"
            style={{ width: size, height: size }}
        >
            <DietitianPicture />
        </span>
    )
}

// Ana sayfanın ilk ekranındaki büyük fotoğraf kartı; adı ve unvanı fotoğrafın üstünde bir etikette
export function DietitianPhotoCard() {
    const { t } = useTranslation()
    return (
        <figure className="relative aspect-[4/5] max-h-[62vh] w-full overflow-hidden rounded-[1.75rem] bg-linear-180 from-cream to-sage shadow-float sm:max-h-none">
            <DietitianPicture />
            <figcaption className="absolute bottom-3 left-3 right-3 rounded-2xl bg-card/95 px-4 py-2.5 text-ink shadow-soft backdrop-blur sm:right-auto">
                <p className="font-bold">{DIETITIAN.name}</p>
                <p className="text-sm text-muted">{t('landing.dietitianTitle')}</p>
            </figcaption>
        </figure>
    )
}

export default DietitianAvatar
