import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Pencil, Plus, StickyNote, Trash2 } from 'lucide-react'

import DayMenu from './DayMenu'
import DayTabs from './DayTabs'
import { deleteDietPlan, getClientDietPlans } from '../../services/dietService'
import { toErrorMessage } from '../../services/errorMessage'
import { mealsOfDay, todayIndex } from '../../diet/dietUtils'
import type { DietPlan } from '../../types/diet'

type DietPlanSectionProps = {
    clientId: number
}

// Diyetisyenin danışan sayfasında: aktif program (önizleme), yeni program, geçmiş programlar
function DietPlanSection({ clientId }: DietPlanSectionProps) {
    const { t, i18n } = useTranslation()

    const [plans, setPlans] = useState<DietPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<unknown>(null)
    const [day, setDay] = useState(todayIndex())

    useEffect(() => {
        let cancelled = false
        getClientDietPlans(clientId)
            .then((result) => !cancelled && setPlans(result))
            .catch((err) => !cancelled && setError(err))
            .finally(() => !cancelled && setLoading(false))
        return () => {
            cancelled = true
        }
    }, [clientId])

    const formatDate = (date: string) => new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString(i18n.language)

    const handleDelete = async (plan: DietPlan) => {
        if (!window.confirm(t('diet.confirmDelete', { title: plan.title }))) {
            return
        }
        try {
            await deleteDietPlan(clientId, plan.id)
            setPlans((current) => current.filter((item) => item.id !== plan.id))
        } catch (err) {
            setError(err)
        }
    }

    const active = plans[0]
    const history = plans.slice(1)

    return (
        <section className="mb-4 rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-ink">{t('diet.sectionTitle')}</h2>
                <Link
                    to={`/clients/${clientId}/diet-plans/new`}
                    className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-cream hover:bg-brand-dark"
                >
                    <Plus className="h-4 w-4" />
                    {t('diet.newPlan')}
                </Link>
            </div>

            {loading && <p className="mt-3 text-muted">{t('dashboard.loading')}</p>}
            {error !== null && <p className="mt-3 text-sm text-red-700">{toErrorMessage(error, t, 'diet.loadError')}</p>}
            {!loading && error === null && !active && <p className="mt-3 text-muted">{t('diet.noPlanDietitian')}</p>}

            {active && (
                <div className="mt-3 space-y-3">
                    <div className="flex items-start justify-between gap-2 rounded-xl bg-cream p-3">
                        <div>
                            <p className="font-semibold text-ink">{active.title}</p>
                            <p className="text-sm text-muted">
                                {t(`diet.type.${active.planType}`)} · {t('diet.startsOn', { date: formatDate(active.startDate) })}
                            </p>
                        </div>
                        <Link
                            to={`/clients/${clientId}/diet-plans/${active.id}`}
                            className="flex shrink-0 items-center gap-1 rounded-full border border-line bg-card px-3 py-1.5 text-sm font-semibold text-brand hover:border-brand"
                        >
                            <Pencil className="h-4 w-4" />
                            {t('diet.edit')}
                        </Link>
                    </div>

                    {/* Danışanın gördüğü menünün önizlemesi */}
                    <details className="group rounded-xl bg-cream px-4 py-3">
                        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
                            {t('diet.preview')}
                            <ChevronDown className="h-4 w-4 text-muted transition group-open:rotate-180" />
                        </summary>
                        <div className="mt-3 space-y-3">
                            {active.planType === 'WEEKLY' && <DayTabs selected={day} onSelect={setDay} />}
                            <DayMenu meals={mealsOfDay(active.meals, active.planType === 'DAILY' ? 0 : day)} />
                            {active.notes && (
                                <p className="flex gap-2 text-sm text-ink">
                                    <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                    <span className="whitespace-pre-line">{active.notes}</span>
                                </p>
                            )}
                        </div>
                    </details>

                    {/* Geçmiş programlar */}
                    {history.length > 0 && (
                        <div>
                            <p className="mb-1 text-sm font-semibold text-muted">{t('diet.history')}</p>
                            <ul className="divide-y divide-line">
                                {history.map((plan) => (
                                    <li key={plan.id} className="flex items-center gap-2 py-2">
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-ink">{plan.title}</span>
                                            <span className="block text-xs text-muted">
                                                {t(`diet.type.${plan.planType}`)} · {formatDate(plan.startDate)}
                                            </span>
                                        </span>
                                        <Link
                                            to={`/clients/${clientId}/diet-plans/${plan.id}`}
                                            aria-label={t('diet.edit')}
                                            className="rounded-full p-2 text-brand hover:bg-cream"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(plan)}
                                            aria-label={t('diet.delete')}
                                            className="rounded-full p-2 text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => handleDelete(active)}
                        className="text-xs font-semibold text-red-700 hover:underline"
                    >
                        {t('diet.deleteActive')}
                    </button>
                </div>
            )}
        </section>
    )
}

export default DietPlanSection
