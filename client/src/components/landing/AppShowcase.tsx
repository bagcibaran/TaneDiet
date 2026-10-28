import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { MEAL_DOT_COLORS } from '../../diet/dietUtils'

// Küçük telefon çerçevesi: uygulama ekranlarının HTML/CSS ile çizilmiş örneği (resim dosyası değil)
function PhoneFrame({ title, big, children, caption }: { title: string; big: string; children: ReactNode; caption: string }) {
    return (
        <figure className="w-40 shrink-0 snap-start">
            <div className="h-64 overflow-hidden rounded-[1.4rem] border-[5px] border-ink bg-cream text-[0.6rem] text-ink shadow-soft">
                <div className="rounded-b-2xl bg-linear-160 from-brand-deep to-brand-light px-2.5 pb-4 pt-2.5 text-cream">
                    <p className="opacity-90">{title}</p>
                    <p className="text-lg font-extrabold leading-tight">{big}</p>
                </div>
                <div className="space-y-1.5 p-1.5">{children}</div>
            </div>
            <figcaption className="mt-2 text-center text-xs font-bold text-ink">{caption}</figcaption>
        </figure>
    )
}

function MiniCard({ children }: { children: ReactNode }) {
    return <div className="rounded-lg bg-card p-1.5">{children}</div>
}

function Dot({ index }: { index: number }) {
    return <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${MEAL_DOT_COLORS[index]}`} />
}

// "Diyet takip sistemi": hizmet alan danışanların kullandığı ekranlar, yana kayan telefonlar
function AppShowcase() {
    const { t } = useTranslation()

    return (
        <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
            <PhoneFrame title={t('landing.shotHomeTitle')} big="72,4 kg" caption={t('landing.shotHome')}>
                <span className="inline-block rounded-full bg-honey px-1.5 font-bold">🏆 −3,1 kg</span>
                <MiniCard>
                    <p className="font-bold">{t('home.todayMenu')}</p>
                    <p><Dot index={0} />Kahvaltı · 09:00</p>
                    <p><Dot index={1} />Öğle · 13:00</p>
                </MiniCard>
                <MiniCard>📉 −0,6 kg · {t('home.days7')}</MiniCard>
            </PhoneFrame>

            <PhoneFrame title={t('nav.menu')} big="Diyet Listesi" caption={t('landing.shotMenu')}>
                <MiniCard>
                    <p className="font-bold"><Dot index={0} />Kahvaltı</p>
                    <p>• 2 yumurta</p>
                    <p>• 5 zeytin</p>
                </MiniCard>
                <MiniCard>
                    <p className="font-bold"><Dot index={2} />Öğle</p>
                    <p>• Sebze yemeği</p>
                    <p className="text-muted">veya köfte</p>
                </MiniCard>
            </PhoneFrame>

            <PhoneFrame title={t('weights.title')} big="−3,1 kg" caption={t('landing.shotChart')}>
                <MiniCard>
                    <svg viewBox="0 0 100 50" className="w-full" aria-hidden="true">
                        <polyline points="0,8 25,15 50,22 75,30 100,40" fill="none" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </MiniCard>
                <MiniCard>28 Eki · 72,4 kg</MiniCard>
                <MiniCard>21 Eki · 73,0 kg</MiniCard>
            </PhoneFrame>

            <PhoneFrame title={t('intake.title')} big="2 / 7" caption={t('landing.shotIntake')}>
                <MiniCard>
                    <p>Kronik hastalığın var mı?</p>
                    <p className="mt-1">
                        <span className="rounded-full bg-sage px-1.5">Yok</span> <span className="rounded-full bg-cream px-1.5">Var</span>
                    </p>
                </MiniCard>
                <MiniCard>Alerjin var mı?</MiniCard>
            </PhoneFrame>
        </div>
    )
}

export default AppShowcase
