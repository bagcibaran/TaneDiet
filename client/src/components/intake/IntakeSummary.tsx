import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

import { INTAKE_STEPS, type IntakeFieldConfig, type IntakeFieldName } from '../../intake/intakeSteps'
import { getClientIntake } from '../../services/intakeService'
import { toErrorMessage } from '../../services/errorMessage'
import type { IntakeForm } from '../../types/intake'

type IntakeSummaryProps = {
    clientId: number
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
function IntakeSummary({ clientId }: IntakeSummaryProps) {
    const { t, i18n } = useTranslation()

    const [form, setForm] = useState<IntakeForm | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getClientIntake(clientId)
            .then(setForm)
            .catch((error) => setError(toErrorMessage(error, t, 'intake.summary.loadError')))
            .finally(() => setLoading(false))
    }, [clientId, t])

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

    return (
        <section className="mb-4 rounded-2xl bg-card p-5 shadow-sm">
            <h2 className="text-lg font-bold text-ink">{t('intake.summary.title')}</h2>

            {loading && <p className="mt-3 text-muted">{t('dashboard.loading')}</p>}
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
            {!loading && !error && !form && <p className="mt-3 text-muted">{t('intake.summary.notFilled')}</p>}

            {!loading && !error && form && (
                <>
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
                                date: new Date(form.updatedAt).toLocaleDateString(i18n.language),
                            })}
                        </span>
                    </div>

                    {/* Önemli cevaplar */}
                    <dl className="mt-4 divide-y divide-line">
                        {HIGHLIGHTS.map((name) => (
                            <div key={name} className="py-2">
                                <dt className="text-xs font-semibold text-muted">{t(`intake.fields.${name}`)}</dt>
                                <dd className="mt-0.5 whitespace-pre-line text-ink">{formatAnswer(name)}</dd>
                            </div>
                        ))}
                    </dl>

                    {/* Tüm cevaplar, bölüm bölüm açılır */}
                    <p className="mt-4 text-sm font-semibold text-muted">{t('intake.summary.allAnswers')}</p>
                    <div className="mt-2 space-y-2">
                        {INTAKE_STEPS.map((step) => (
                            <details key={step.key} className="group rounded-xl bg-cream px-4 py-3">
                                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
                                    {t(`intake.steps.${step.key}`)}
                                    <ChevronDown className="h-4 w-4 text-muted transition group-open:rotate-180" />
                                </summary>
                                <dl className="mt-2 divide-y divide-line">
                                    {step.fields.map((field) => (
                                        <div key={field.name} className="py-2">
                                            <dt className="text-xs text-muted">{t(`intake.fields.${field.name}`)}</dt>
                                            <dd className="mt-0.5 whitespace-pre-line text-ink">{formatAnswer(field.name)}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </details>
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

export default IntakeSummary
