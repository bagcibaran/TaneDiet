import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, ShieldCheck } from 'lucide-react'

import AuthLayout from '../AppLayout/Routes/AuthLayout'
import LegalText from '../components/legal/LegalText'
import { SkeletonCard } from '../components/Skeleton'
import WhatsAppButton from '../components/WhatsAppButton'
import { useFeedback } from '../components/feedback/useFeedback'
import { errorTextClass, primaryButtonClass } from '../components/ui'
import { usePageTitle } from '../hooks/usePageTitle'
import { ApiError } from '../services/apiClient'
import { toErrorMessage } from '../services/errorMessage'
import { acceptConsent, getConsentText } from '../services/legalService'
import { clearSession } from '../services/session'
import type { LegalText as LegalTextData } from '../types/legal'

// Açık rıza metni değişti (ya da hiç onaylanmamış): danışan güncel metni onaylayana kadar backend 428 verir ve
// apiClient buraya gönderir. Onaylamazsa uygulamayı kullanamaz; diyetisyene WhatsApp'tan yazabilir.
function ConsentPage() {
    const { t } = useTranslation()
    usePageTitle(t('consent.title'))
    const navigate = useNavigate()
    const { toast } = useFeedback()
    const [consent, setConsent] = useState<LegalTextData | null>(null)
    // Ham hatalar saklanır, ekrana çizilirken çevrilir
    const [loadError, setLoadError] = useState<unknown>(null)
    const [saveError, setSaveError] = useState<unknown>(null)
    const [saving, setSaving] = useState(false)
    const [declined, setDeclined] = useState(false)
    // Artınca metin yeniden yüklenir (onay sırasında metin güncellenmişse)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let cancelled = false
        getConsentText()
            .then((text) => {
                if (!cancelled) {
                    setConsent(text)
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setLoadError(error)
                }
            })
        return () => {
            cancelled = true
        }
    }, [reloadKey])

    const handleAccept = async () => {
        if (!consent || saving) {
            return
        }
        setSaving(true)
        setSaveError(null)
        try {
            await acceptConsent(consent.version)
            toast(t('consent.accepted'))
            navigate('/dashboard', { replace: true })
        } catch (error) {
            setSaveError(error)
            // 409: metin bu arada güncellendi, yenisini göster
            if (error instanceof ApiError && error.status === 409) {
                setConsent(null)
                setReloadKey((key) => key + 1)
            }
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = () => {
        clearSession()
        navigate('/login')
    }

    if (declined) {
        return (
            <AuthLayout>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink">{t('consent.declinedTitle')}</h1>
                <p className="mb-6 mt-2 text-muted">{t('consent.declinedText')}</p>
                <WhatsAppButton text={t('consent.whatsappMessage')} label={t('whatsapp.contact')} />
                <button
                    type="button"
                    onClick={() => setDeclined(false)}
                    className="mt-3 w-full rounded-full border border-line px-4 py-3 font-semibold text-ink transition hover:bg-cream"
                >
                    {t('consent.back')}
                </button>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-danger hover:bg-danger-soft"
                >
                    <LogOut className="h-4 w-4" />
                    {t('dashboard.logout')}
                </button>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout wide>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage text-brand">
                <ShieldCheck className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">{t('consent.title')}</h1>
            <p className="mt-1 text-muted">{t('consent.intro')}</p>

            {loadError !== null && consent === null && (
                <p className={`mt-4 ${errorTextClass}`}>{toErrorMessage(loadError, t, 'privacy.loadError')}</p>
            )}

            {consent === null && loadError === null && <SkeletonCard bare lines={6} label={t('common.loading')} />}

            {consent && (
                <>
                    <div className="mt-6 max-h-[55vh] overflow-y-auto rounded-2xl border border-line bg-cream p-4">
                        <LegalText text={consent.text} />
                    </div>
                    <p className="mt-2 text-xs text-muted">
                        {t('privacy.version', { version: consent.version })} ·{' '}
                        <Link to="/gizlilik" target="_blank" className="font-semibold text-brand hover:text-brand-dark">
                            {t('consent.fullPrivacy')}
                        </Link>
                    </p>

                    {saveError !== null && (
                        <p className={`mt-4 ${errorTextClass}`}>{toErrorMessage(saveError, t, 'consent.error')}</p>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
                        <button type="button" onClick={handleAccept} disabled={saving} className={primaryButtonClass}>
                            {saving ? t('consent.accepting') : t('consent.accept')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeclined(true)}
                            disabled={saving}
                            className="w-full rounded-full border border-line px-4 py-3 font-semibold text-ink transition hover:bg-cream disabled:opacity-50"
                        >
                            {t('consent.decline')}
                        </button>
                    </div>
                </>
            )}
        </AuthLayout>
    )
}

export default ConsentPage
