import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BellDot, ChevronDown, ClipboardList } from 'lucide-react'

import { INTAKE_STEPS, type IntakeFieldConfig, type IntakeFieldName } from '../../intake/intakeSteps'
import { getClientIntake } from '../../services/intakeService'
import { toErrorMessage } from '../../services/errorMessage'
import type { IntakeForm } from '../../types/intake'
import type { IntakeStatus } from '../../types/client'

type IntakeSummaryProps = {
    clientId: number
    // Diyetisyen son baktığından beri: form yeni mi, güncellendi mi, hangi sorular değişti?
    intakeStatus?: IntakeStatus
    changedFields?: string[]
}

// Diyetisyenin ilk bakışta görmek istediği cevaplar
const HIGHLIGHTS: IntakeFieldName[] = [
    'chronicDiseases',
    'surgeries',
    'medications',
    'allergies',
    'mainMeals',
    'goal',
    'specialDiet',
]

const FIELDS_BY_NAME = new Map<IntakeFieldName, IntakeFieldConfig>(
    INTAKE_STEPS.flatMap((step) => step.fields.map((field) => [field.name, field] as const)),
)

// Diyetisyenin danışan sayfasında gördüğü ön görüşme özeti
function IntakeSummary({ clientId, intakeStatus, changedFields = [] }: IntakeSummaryProps) {
    const { t, i18n } = useTranslation()

    const [form, setForm] = useState<IntakeForm | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    // Ham hata saklanır, mesaj ekrana çizilirken çevrilir
    const [error, setError] = useState<unknown>(null)
    // Bilgiler sayfada çok yer kaplamasın: kapalı başlar, "Görüntüle" ile açılır
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        let cancelled = false
        getClientIntake(clientId)
            .then((result) => {
                if (!cancelled) {
                    setForm(result)
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setError(error)
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false)
                }
            })
        return () => {
            cancelled = true
        }
    }, [clientId])

    const isChanged = (name: string) => changedFields.includes(name)
    // Diyetisyen son baktığından beri yeni bir şey var mı? (başlıkta küçük etiket)
    const hasNews = intakeStatus === 'NEW' || (intakeStatus === 'UPDATED' && changedFields.length > 0)

    // Bir cevabı ekranda okunacak metne çevirir; boş cevaplar "Yok"
    const formatAnswer = (name: IntakeFieldName): string => {
        const field = FIELDS_BY_NAME.get(name)
        const value = form?.[name]
        if (value === null || value === undefined || value === '') {
            return t('intake.summary.none')
        }
        if (typeof value === 'boolean') {
            return value ? t('intake.yes') : t('intake.no')
        }
        if (field?.kind === 'choice') {
            const label = t(`intake.options.${field.optionSet}.${value}`)
            return name === 'goal' && value === 'OTHER' && form?.goalOther ? `${label}: ${form.goalOther}` : label
        }
        if (field?.kind === 'date') {
            return new Date(`${value}T00:00:00`).toLocaleDateString(i18n.language)
        }
        return typeof value === 'number' ? value.toLocaleString(i18n.language) : value
    }

    // Bir cevap satırı; değiştiyse açık yeşil zemin ve "Güncellendi" etiketi
    const answerRow = (name: IntakeFieldName, bold: boolean) => (
        <div key={name} className={`py-2 ${isChanged(name) ? '-mx-2 rounded-lg bg-mint/30 px-2' : ''}`}>
            <dt className={`text-xs text-muted ${bold ? 'font-semibold' : ''}`}>
                {t(`intake.fields.${name}`)}
                {isChanged(name) && (
                    <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[0.65rem] font-semibold text-cream">
                        {t('intake.summary.changed')}
                    </span>
                )}
            </dt>
            <dd className="mt-0.5 whitespace-pre-line text-ink">{formatAnswer(name)}</dd>
        </div>
    )

    return (
        <section className="mb-4 rounded-3xl bg-card p-5 shadow-soft">
            {/* Başlık satırı: başlık, yenilik etiketi ve Görüntüle / Gizle düğmesi */}
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint/40 text-brand">
                    <ClipboardList className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-ink">{t('intake.summary.title')}</h2>
                    {hasNews && (
                        <span className="mt-0.5 inline-block rounded-full bg-peach px-2 py-0.5 text-xs font-semibold text-peach-ink">
                            {intakeStatus === 'NEW' ? t('clients.badges.newIntake') : t('clients.badges.intakeUpdated')}
                        </span>
                    )}
                </div>
                {!loading && error === null && form && (
                    <button
                        type="button"
                        onClick={() => setExpanded((value) => !value)}
                        aria-expanded={expanded}
                        className="flex shrink-0 items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-brand hover:border-brand"
                    >
                        {expanded ? t('intake.summary.hide') : t('intake.summary.show')}
                        <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>

            {loading && <p className="mt-3 text-muted">{t('dashboard.loading')}</p>}
            {error !== null && (
                <p className="mt-3 text-sm text-red-700">{toErrorMessage(error, t, 'intake.summary.loadError')}</p>
            )}
            {!loading && error === null && !form && <p className="mt-3 text-muted">{t('intake.summary.notFilled')}</p>}

            {!loading && error === null && form && expanded && (
                <>
                    {/* Bildirim: form yeni mi, hangi sorular değişti? */}
                    {hasNews && (
                        <p className="mt-3 flex items-start gap-2 rounded-xl bg-mint/30 p-3 text-sm text-ink">
                            <BellDot className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                            {intakeStatus === 'NEW'
                                ? t('intake.summary.newBanner')
                                : t('intake.summary.updatedBanner', { count: changedFields.length })}
                        </p>
                    )}

                    {/* Yaş, boy, son güncelleme */}
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        <span className="rounded-full bg-cream px-3 py-1 text-ink">
                            {t('intake.summary.age')}: <strong>{form.age}</strong>
                        </span>
                        <span className="rounded-full bg-cream px-3 py-1 text-ink">
                            {t('intake.summary.height')}: <strong>{form.heightCm} cm</strong>
                        </span>
                        <span className="rounded-full bg-cream px-3 py-1 text-muted">
                            {t('intake.summary.updatedAt', {
                                // "2026-10-28T03:14:26.409288" → yalnızca gün (uzun kesirli saniyeyi her tarayıcı okumaz)
                                date: new Date(`${form.updatedAt.slice(0, 10)}T00:00:00`).toLocaleDateString(i18n.language),
                            })}
                        </span>
                    </div>

                    {/* Önemli cevaplar */}
                    <dl className="mt-4 divide-y divide-line">{HIGHLIGHTS.map((name) => answerRow(name, true))}</dl>

                    {/* Tüm cevaplar, bölüm bölüm açılır. Değişen soru olan bölümler açık gelir. */}
                    <p className="mt-4 text-sm font-semibold text-muted">{t('intake.summary.allAnswers')}</p>
                    <div className="mt-2 space-y-2">
                        {INTAKE_STEPS.map((step) => {
                            const stepChanged = step.fields.some((field) => isChanged(field.name))
                            return (
                                <details
                                    key={`${step.key}-${stepChanged}`}
                                    open={stepChanged}
                                    className="group rounded-xl bg-cream px-4 py-3"
                                >
                                    <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
                                        <span className="flex items-center gap-2">
                                            {t(`intake.steps.${step.key}`)}
                                            {stepChanged && <span className="h-2 w-2 rounded-full bg-brand" />}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-muted transition group-open:rotate-180" />
                                    </summary>
                                    <dl className="mt-2 divide-y divide-line">
                                        {step.fields.map((field) => answerRow(field.name, false))}
                                    </dl>
                                </details>
                            )
                        })}
                    </div>
                </>
            )}
        </section>
    )
}

export default IntakeSummary
