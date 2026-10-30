import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Printer } from 'lucide-react'

import { SkeletonCard } from '../components/Skeleton'
import { primaryButtonClass } from '../components/ui'
import { itemLines } from '../diet/dietUtils'
import { formatIntakeAnswer } from '../intake/formatAnswer'
import { INTAKE_STEPS } from '../intake/intakeSteps'
import { usePageTitle } from '../hooks/usePageTitle'
import { getClientExport } from '../services/clientDataService'
import { toErrorMessage } from '../services/errorMessage'
import { formatDateTime, formatKg } from '../utils/format'
import type { ClientExport } from '../types/clientData'
import type { DietPlan } from '../types/diet'

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="mt-8 break-inside-avoid-page">
            <h2 className="border-b border-line pb-1 text-lg font-extrabold tracking-tight text-ink">{title}</h2>
            <div className="mt-3 text-sm text-ink">{children}</div>
        </section>
    )
}

// KVKK: diyetisyenin danışan hakkında tuttuğu her şey, yazdırılabilir tek sayfa.
// Danışan verilerini isterse diyetisyen "PDF olarak kaydet" ile alıp WhatsApp'tan iletir.
function ClientExportPage() {
    const { t, i18n } = useTranslation()
    const { id } = useParams()
    const clientId = Number(id)

    const [data, setData] = useState<ClientExport | null>(null)
    // Ham hata saklanır, ekrana çizilirken çevrilir
    const [error, setError] = useState<unknown>(null)
    usePageTitle(data ? `${t('clientData.exportTitle')} · ${data.client.username}` : t('clientData.exportTitle'))

    // Her dışa aktarma erişim kaydına yazılır. StrictMode efekti iki kez çalıştırır; aynı istek
    // yeniden kullanılır ki kayıtta iki satır çıkmasın.
    const request = useRef<{ clientId: number; promise: Promise<ClientExport> } | null>(null)

    useEffect(() => {
        if (Number.isNaN(clientId)) {
            return
        }
        if (request.current?.clientId !== clientId) {
            request.current = { clientId, promise: getClientExport(clientId) }
        }
        let cancelled = false
        request.current.promise
            .then((result) => {
                if (!cancelled) {
                    setData(result)
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
    }, [clientId])

    const intake = data?.intake ?? null

    const formatDate = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString(i18n.language)

    const dayLabel = (dayIndex: number) => (dayIndex === 0 ? t('clientData.everyDay') : t(`diet.days.long.${dayIndex}`))

    const planMeals = (plan: DietPlan) => {
        const days = [...new Set(plan.meals.map((meal) => meal.dayIndex))].sort((a, b) => a - b)
        return days.map((day) => (
            <div key={day} className="mt-2">
                <p className="font-semibold">{dayLabel(day)}</p>
                <ul className="ml-4 list-disc">
                    {plan.meals
                        .filter((meal) => meal.dayIndex === day)
                        .sort((a, b) => a.position - b.position)
                        .map((meal) => (
                            <li key={meal.position}>
                                <span className="font-medium">
                                    {meal.name}
                                    {meal.time ? ` (${meal.time})` : ''}:
                                </span>{' '}
                                {itemLines(meal.items).join(', ')}
                            </li>
                        ))}
                </ul>
            </div>
        ))
    }

    return (
        <main className="min-h-screen bg-card px-4 py-6 print:p-0">
            <div className="mx-auto max-w-3xl">
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <Link
                        to={`/clients/${clientId}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('clientData.back')}
                    </Link>
                    {data && (
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className={`inline-flex w-auto items-center gap-2 ${primaryButtonClass}`}
                        >
                            <Printer className="h-4 w-4" />
                            {t('clientData.print')}
                        </button>
                    )}
                </div>

                <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink print:mt-0">
                    {t('clientData.exportTitle')}
                </h1>
                <p className="text-sm text-muted">tane. online diyet · Dyt. Betül Bağcı</p>

                {error !== null && <p className="mt-4 text-sm text-danger">{toErrorMessage(error, t, 'clientData.loadError')}</p>}
                {data === null && error === null && <SkeletonCard bare lines={8} label={t('common.loading')} />}

                {data && (
                    <>
                        <p className="mt-1 text-sm text-muted">
                            {t('clientData.exportedAt', { date: formatDateTime(data.exportedAt, i18n.language) })}
                        </p>

                        <Section title={t('clientData.sections.account')}>
                            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                                <dt className="text-muted">{t('clientData.username')}</dt>
                                <dd>{data.client.username}</dd>
                                <dt className="text-muted">{t('clientData.email')}</dt>
                                <dd>{data.client.email}</dd>
                                <dt className="text-muted">{t('clientData.serviceUntil')}</dt>
                                <dd>{data.accessUntil ? formatDate(data.accessUntil) : t('clientData.unlimited')}</dd>
                            </dl>
                        </Section>

                        <Section title={t('clientData.sections.consents')}>
                            {data.consents.length === 0 ? (
                                <p className="text-muted">{t('clientData.none')}</p>
                            ) : (
                                <ul className="space-y-1">
                                    {data.consents.map((consent) => (
                                        <li key={consent.acceptedAt}>
                                            {t('clientData.consentLine', {
                                                version: consent.version,
                                                date: formatDateTime(consent.acceptedAt, i18n.language),
                                            })}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Section>

                        <Section title={t('clientData.sections.intake')}>
                            {intake === null ? (
                                <p className="text-muted">{t('clientData.intakeMissing')}</p>
                            ) : (
                                INTAKE_STEPS.map((step) => (
                                    <div key={step.key} className="mb-4 break-inside-avoid">
                                        <h3 className="font-bold">{t(`intake.steps.${step.key}`)}</h3>
                                        <dl className="mt-1 divide-y divide-line">
                                            {step.fields.map((field) => (
                                                <div key={field.name} className="grid gap-x-4 py-1 sm:grid-cols-[14rem_1fr]">
                                                    <dt className="text-muted">{t(`intake.fields.${field.name}`)}</dt>
                                                    <dd className="whitespace-pre-line">
                                                        {formatIntakeAnswer(intake, field.name, t, i18n.language)}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                ))
                            )}
                        </Section>

                        <Section title={t('clientData.sections.weights')}>
                            {data.weights.length === 0 ? (
                                <p className="text-muted">{t('clientData.none')}</p>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="text-muted">
                                        <tr>
                                            <th className="py-1 font-semibold">{t('clientData.date')}</th>
                                            <th className="py-1 font-semibold">{t('clientData.weight')}</th>
                                            <th className="py-1 font-semibold">{t('clientData.enteredBy')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {data.weights.map((entry) => (
                                            <tr key={entry.id}>
                                                <td className="py-1">{formatDate(entry.measuredOn)}</td>
                                                <td className="py-1">{formatKg(entry.weightKg, i18n.language)}</td>
                                                <td className="py-1">{entry.enteredBy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </Section>

                        <Section title={t('clientData.sections.plans')}>
                            {data.plans.length === 0 ? (
                                <p className="text-muted">{t('clientData.none')}</p>
                            ) : (
                                data.plans.map((plan) => (
                                    <div key={plan.id} className="mb-5 break-inside-avoid">
                                        <h3 className="font-bold">
                                            {plan.title} · {t(`diet.type.${plan.planType}`)} ·{' '}
                                            {t('diet.startsOn', { date: formatDate(plan.startDate) })}
                                        </h3>
                                        {plan.notes && <p className="mt-1 whitespace-pre-line text-muted">{plan.notes}</p>}
                                        {planMeals(plan)}
                                    </div>
                                ))
                            )}
                        </Section>

                        <Section title={t('clientData.sections.accessLog')}>
                            {data.accessLog.length === 0 ? (
                                <p className="text-muted">{t('clientData.none')}</p>
                            ) : (
                                <ul className="space-y-1">
                                    {data.accessLog.map((entry, index) => (
                                        <li key={index}>
                                            {formatDateTime(entry.createdAt, i18n.language)} ·{' '}
                                            {t(`clientData.actions.${entry.action}`)} · {entry.viewer}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Section>
                    </>
                )}
            </div>
        </main>
    )
}

export default ClientExportPage
