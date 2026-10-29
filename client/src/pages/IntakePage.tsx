import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Info, LogOut } from 'lucide-react'

import Logo from '../components/Logo'
import LanguageToggle from '../components/LanguageToggle'
import { HeroBlobs } from '../components/PageLayout'
import IntakeField from '../components/intake/IntakeField'
import { SkeletonCard } from '../components/Skeleton'
import { errorTextClass, primaryButtonClass } from '../components/ui'
import { INTAKE_STEPS, fromForm, isVisible, toRequest, validateField, type IntakeAnswers } from '../intake/intakeSteps'
import { getMyIntake, saveMyIntake } from '../services/intakeService'
import { toErrorMessage } from '../services/errorMessage'
import { clearSession, getUsername } from '../services/session'
import { usePageTitle } from '../hooks/usePageTitle'

type Draft = {
    answers: IntakeAnswers
    step: number
}

// Yarım kalan form tarayıcıda saklanır; sayfa yenilense de kaldığı yerden devam edilir
const draftKey = () => `intakeDraft:${getUsername()}`

function readDraft(): Draft | null {
    try {
        const raw = localStorage.getItem(draftKey())
        return raw ? (JSON.parse(raw) as Draft) : null
    } catch {
        return null
    }
}

function writeDraft(draft: Draft) {
    try {
        localStorage.setItem(draftKey(), JSON.stringify(draft))
    } catch {
        // Tarayıcı saklamaya izin vermiyorsa form yine çalışır, yalnızca taslak kaybolur
    }
}

function clearDraft() {
    try {
        localStorage.removeItem(draftKey())
    } catch {
        // yok say
    }
}

// Ön görüşme formu: 7 adım. İlk kez doldurulurken açık rıza ister, sonra güncellenebilir.
function IntakePage() {
    const { t } = useTranslation()
    usePageTitle(t('intake.title'))
    const navigate = useNavigate()

    const [answers, setAnswers] = useState<IntakeAnswers>({})
    const [step, setStep] = useState(0)
    // null: henüz bilinmiyor (yükleniyor), true: kayıtlı form var (güncelleme), false: ilk kez dolduruluyor
    const [hasSavedForm, setHasSavedForm] = useState<boolean | null>(null)
    const [consent, setConsent] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [stepError, setStepError] = useState('')
    // Ham hata saklanır, mesaj ekrana çizilirken çevrilir (dil değişince doğru dilde görünsün)
    const [loadError, setLoadError] = useState<unknown>(null)
    const [saving, setSaving] = useState(false)
    const [finished, setFinished] = useState(false)

    // Form yalnızca sayfa açılınca yüklenir. `t` bağımlılık olsaydı dil değişince form
    // yeniden yüklenir ve kaydedilmemiş değişiklikler kaybolurdu.
    useEffect(() => {
        getMyIntake()
            .then((form) => {
                if (form) {
                    setAnswers(fromForm(form))
                    setHasSavedForm(true)
                } else {
                    const draft = readDraft()
                    if (draft) {
                        setAnswers(draft.answers)
                        setStep(Math.min(draft.step, INTAKE_STEPS.length - 1))
                    }
                    setHasSavedForm(false)
                }
            })
            .catch(setLoadError)
    }, [])

    const current = INTAKE_STEPS[step]
    const isLastStep = step === INTAKE_STEPS.length - 1

    const updateAnswer = (name: string, value: string | boolean) => {
        const next = { ...answers, [name]: value }
        setAnswers(next)
        setFieldErrors((errors) => ({ ...errors, [name]: '' }))
        if (hasSavedForm === false) {
            writeDraft({ answers: next, step })
        }
    }

    const goToStep = (nextStep: number) => {
        setStep(nextStep)
        setStepError('')
        if (hasSavedForm === false) {
            writeDraft({ answers, step: nextStep })
        }
        window.scrollTo({ top: 0 })
    }

    // Bu adımdaki soruları kontrol eder; hata varsa gösterir ve false döner
    const validateStep = (): boolean => {
        const errors: Record<string, string> = {}
        // Yalnızca görünen sorular kontrol edilir
        for (const field of current.fields.filter((item) => isVisible(item, answers))) {
            const error = validateField(field, answers[field.name])
            if (error) {
                errors[field.name] = error
            }
        }
        setFieldErrors(errors)
        if (Object.keys(errors).length > 0) {
            setStepError(t('intake.requiredMissing'))
            return false
        }
        return true
    }

    const handleNext = () => {
        if (validateStep()) {
            goToStep(step + 1)
        }
    }

    const handleSubmit = async () => {
        if (!validateStep()) {
            return
        }
        if (!hasSavedForm && !consent) {
            setStepError(t('intake.consentRequired'))
            return
        }

        setSaving(true)
        setStepError('')
        try {
            await saveMyIntake({ ...toRequest(answers), consent: hasSavedForm ? undefined : true })
            clearDraft()
            if (hasSavedForm) {
                navigate('/dashboard')
            } else {
                setFinished(true)
                window.scrollTo({ top: 0 })
            }
        } catch (error) {
            setStepError(toErrorMessage(error, t, 'intake.saveError'))
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = () => {
        // Yarım kalan taslakta sağlık bilgileri var; ortak kullanılan bir telefonda kalmasın
        clearDraft()
        clearSession()
        navigate('/login')
    }

    return (
        <main className="min-h-screen bg-cream pb-10">
            {/* Yeşil başlık: logo, dil, adım ve ilerleme çubuğu */}
            <div className="relative rounded-b-[2.25rem] bg-linear-160 from-brand-deep via-brand to-brand-light px-5 pb-16 pt-6 text-cream">
                <HeroBlobs />
                <div className="relative mx-auto max-w-xl">
                    <div className="flex items-start justify-between">
                        <Logo to="/dashboard" />
                        <LanguageToggle />
                    </div>

                    <p className="mt-6 text-sm text-mint">{t('intake.title')}</p>
                    {finished ? (
                        <h1 className="text-2xl font-extrabold tracking-tight">{t('intake.thanksTitle')}</h1>
                    ) : (
                        <>
                            <h1 className="text-2xl font-extrabold tracking-tight">{t(`intake.steps.${current.key}`)}</h1>
                            <p className="mt-1 text-sm text-mint">
                                {t('intake.stepOf', { current: step + 1, total: INTAKE_STEPS.length })}
                            </p>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream/25">
                                <div
                                    className="h-full rounded-full bg-cream transition-all"
                                    style={{ width: `${((step + 1) / INTAKE_STEPS.length) * 100}%` }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="mx-auto -mt-10 max-w-xl px-4">
                <section className="rounded-3xl bg-card p-5 shadow-soft">
                    {loadError !== null && (
                        <p className={errorTextClass}>{toErrorMessage(loadError, t, 'intake.loadError')}</p>
                    )}

                    {loadError === null && hasSavedForm === null && <SkeletonCard lines={5} label={t('dashboard.loading')} />}

                    {finished && (
                        <div className="space-y-4">
                            <p className="text-ink">{t('intake.thanks')}</p>
                            <button type="button" onClick={() => navigate('/dashboard')} className={primaryButtonClass}>
                                {t('intake.goHome')}
                            </button>
                        </div>
                    )}

                    {!finished && hasSavedForm !== null && (
                        <div className="space-y-5">
                            {current.note === 'bloodTest' && (
                                <div className="flex gap-3 rounded-2xl bg-mint/30 p-4 text-sm text-ink">
                                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                    <div className="space-y-2">
                                        <p>{t('intake.bloodTestNote')}</p>
                                        <p>{t('intake.doctorNote')}</p>
                                    </div>
                                </div>
                            )}

                            {current.fields.filter((field) => isVisible(field, answers)).map((field) => (
                                <IntakeField
                                    key={field.name}
                                    field={field}
                                    value={answers[field.name]}
                                    onChange={(value) => updateAnswer(field.name, value)}
                                    error={fieldErrors[field.name]}
                                />
                            ))}

                            {/* Açık rıza: yalnızca ilk gönderimde, son adımda */}
                            {isLastStep && !hasSavedForm && (
                                <label className="flex gap-3 rounded-2xl border border-line bg-cream p-4 text-sm text-ink">
                                    <input
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(event) => {
                                            setConsent(event.target.checked)
                                            setStepError('')
                                        }}
                                        className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
                                    />
                                    <span>{t('intake.consent')}</span>
                                </label>
                            )}

                            {stepError && <p className={errorTextClass}>{stepError}</p>}

                            <div className="flex gap-3">
                                {step > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => goToStep(step - 1)}
                                        className="flex-1 rounded-full border border-line px-4 py-3 font-semibold text-muted hover:border-brand hover:text-brand"
                                    >
                                        {t('intake.back')}
                                    </button>
                                ) : (
                                    hasSavedForm && (
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            className="flex-1 rounded-full border border-line px-4 py-3 font-semibold text-muted hover:border-brand hover:text-brand"
                                        >
                                            {t('intake.cancel')}
                                        </button>
                                    )
                                )}

                                {isLastStep ? (
                                    <button type="button" onClick={handleSubmit} disabled={saving} className={`flex-1 ${primaryButtonClass}`}>
                                        {saving ? t('intake.saving') : hasSavedForm ? t('intake.update') : t('intake.submit')}
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleNext} className={`flex-1 ${primaryButtonClass}`}>
                                        {t('intake.next')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* Form zorunlu olduğu için danışanın sıkışıp kalmaması adına çıkış her zaman açık */}
                <button
                    type="button"
                    onClick={handleLogout}
                    className="mx-auto mt-6 flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand"
                >
                    <LogOut className="h-4 w-4" />
                    {t('dashboard.logout')}
                </button>
            </div>
        </main>
    )
}

export default IntakePage
