import { useTranslation } from 'react-i18next'

// Gerçek ekran görüntüleri (örnek danışan "Ayşe", gerçek veri değil): public/showcase/<dil>/<ekran>.webp, 375×700 (2x).
// Yeniden çekmek için: DEVAM_NOTU.md'deki "Tanıtım ekran görüntüleri" notu. Görüntüsü olmayan dilde Türkçeleri gösterilir.
const SHOT_LANGUAGES = ['tr', 'en']

const SHOTS = [
    { name: 'home', caption: 'landing.shotHome' },
    { name: 'menu', caption: 'landing.shotMenu' },
    { name: 'chart', caption: 'landing.shotChart' },
    { name: 'intake', caption: 'landing.shotIntake' },
] as const

// "Diyet takip sistemi": hizmet alan danışanların kullandığı ekranlar, yana kayan telefonlar
function AppShowcase() {
    const { t, i18n } = useTranslation()
    const code = (i18n.language ?? 'tr').slice(0, 2)
    const lang = SHOT_LANGUAGES.includes(code) ? code : 'tr'

    return (
        <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
            {SHOTS.map((shot) => (
                <figure key={shot.name} className="w-44 shrink-0 snap-start">
                    <div className="overflow-hidden rounded-[1.6rem] border-[5px] border-ink bg-cream shadow-soft">
                        <img
                            src={`/showcase/${lang}/${shot.name}.webp`}
                            alt={t(shot.caption)}
                            width={375}
                            height={700}
                            loading="lazy"
                            decoding="async"
                            className="block aspect-[375/700] w-full"
                        />
                    </div>
                    <figcaption className="mt-2 text-center text-xs font-bold text-ink">{t(shot.caption)}</figcaption>
                </figure>
            ))}
        </div>
    )
}

export default AppShowcase
