import { useTranslation } from 'react-i18next'

import WhatsAppButton from '../WhatsAppButton'
import { HeroBlobs } from '../PageLayout'

// Sayfanın sonunda son çağrı: WhatsApp
function FinalCall() {
    const { t } = useTranslation()

    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-linear-160 from-brand-deep to-brand-light p-6 text-center text-cream shadow-soft">
            <HeroBlobs />
            <div className="relative">
                <h2 className="text-2xl font-extrabold tracking-tight">{t('landing.finalTitle')}</h2>
                <p className="mx-auto mb-5 mt-2 max-w-sm text-sm text-cream/90">{t('landing.finalText')}</p>
                <div className="mx-auto max-w-sm">
                    <WhatsAppButton text={t('whatsapp.ask')} label={t('whatsapp.contact')} size="lg" />
                </div>
            </div>
        </div>
    )
}

export default FinalCall
