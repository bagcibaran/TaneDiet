import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'

import AuthLayout from '../AppLayout/Routes/AuthLayout'
import LegalText from '../components/legal/LegalText'
import { SkeletonCard } from '../components/Skeleton'
import { errorTextClass } from '../components/ui'
import { usePageTitle } from '../hooks/usePageTitle'
import { toErrorMessage } from '../services/errorMessage'
import { getConsentText, getPrivacyText } from '../services/legalService'
import type { LegalText as LegalTextData } from '../types/legal'

type Texts = {
    privacy: LegalTextData
    consent: LegalTextData
}

// Herkese açık gizlilik sayfası: aydınlatma metni ve altında açık rıza metni (#acik-riza)
function PrivacyPage() {
    const { t } = useTranslation()
    usePageTitle(t('privacy.title'))
    const location = useLocation()
    const [texts, setTexts] = useState<Texts | null>(null)
    // Ham hata saklanır, ekrana çizilirken çevrilir
    const [error, setError] = useState<unknown>(null)

    useEffect(() => {
        let cancelled = false
        Promise.all([getPrivacyText(), getConsentText()])
            .then(([privacy, consent]) => {
                if (!cancelled) {
                    setTexts({ privacy, consent })
                }
            })
            .catch((loadError: unknown) => {
                if (!cancelled) {
                    setError(loadError)
                }
            })
        return () => {
            cancelled = true
        }
    }, [])

    // Metin sonradan yüklendiği için tarayıcı #acik-riza'ya kendisi kaydıramaz
    useEffect(() => {
        if (texts && location.hash) {
            document.getElementById(location.hash.slice(1))?.scrollIntoView()
        }
    }, [texts, location.hash])

    return (
        <AuthLayout wide>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage text-brand">
                <ShieldCheck className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">{t('privacy.title')}</h1>

            {error !== null && <p className={`mt-4 ${errorTextClass}`}>{toErrorMessage(error, t, 'privacy.loadError')}</p>}

            {texts === null && error === null && <SkeletonCard bare lines={8} label={t('common.loading')} />}

            {texts && (
                <>
                    <div className="mt-6">
                        <LegalText text={texts.privacy.text} />
                        <p className="mt-4 text-xs text-muted">{t('privacy.version', { version: texts.privacy.version })}</p>
                    </div>

                    <div id="acik-riza" className="mt-8 scroll-mt-6 border-t border-line pt-6">
                        <LegalText text={texts.consent.text} />
                        <p className="mt-4 text-xs text-muted">{t('privacy.version', { version: texts.consent.version })}</p>
                    </div>
                </>
            )}
        </AuthLayout>
    )
}

export default PrivacyPage
