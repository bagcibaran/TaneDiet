import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StickyNote } from 'lucide-react'

import { PageBody, PageHero } from '../components/PageLayout'
import DayMenu from '../components/diet/DayMenu'
import DayTabs from '../components/diet/DayTabs'
import { LoadingCards } from '../components/Skeleton'
import { getMyDietPlan } from '../services/dietService'
import { toErrorMessage } from '../services/errorMessage'
import { mealsOfDay, todayIndex } from '../diet/dietUtils'
import type { DietPlan } from '../types/diet'
import { usePageTitle } from '../hooks/usePageTitle'

// Danışanın "Menüm" sekmesi: diyetisyenin yazdığı aktif program
function MenuPage() {
    const { t, i18n } = useTranslation()
    usePageTitle(t('nav.menu'))

    const [plan, setPlan] = useState<DietPlan | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<unknown>(null)
    // Haftalık programda gösterilen gün; telefonun tarihine göre bugün ile başlar
    const [day, setDay] = useState(todayIndex())

    useEffect(() => {
        getMyDietPlan()
            .then(setPlan)
            .catch(setError)
            .finally(() => setLoading(false))
    }, [])

    const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(i18n.language)
    const meals = plan ? mealsOfDay(plan.meals, plan.planType === 'DAILY' ? 0 : day) : []

    return (
        <>
            <PageHero>
                <p className="text-sm text-mint">{t('diet.myMenu')}</p>
                <h1 className="text-3xl font-extrabold tracking-tight">{plan ? plan.title : t('diet.myMenu')}</h1>
                {plan && (
                    <p className="mt-1 text-sm text-mint">
                        {t(plan.planType === 'DAILY' ? 'diet.type.DAILY' : 'diet.type.WEEKLY')} ·{' '}
                        {t('diet.startsOn', { date: formatDate(plan.startDate) })}
                    </p>
                )}
            </PageHero>

            <PageBody>
                {loading && <LoadingCards count={3} label={t('dashboard.loading')} />}

                {error !== null && (
                    <p className="rounded-3xl bg-card p-5 text-danger shadow-soft">
                        {toErrorMessage(error, t, 'diet.loadError')}
                    </p>
                )}

                {!loading && error === null && !plan && (
                    <p className="rounded-3xl bg-card p-5 text-muted shadow-soft">{t('diet.noPlanClient')}</p>
                )}

                {plan && (
                    <div className="space-y-3">
                        {plan.planType === 'WEEKLY' && (
                            <>
                                <DayTabs selected={day} onSelect={setDay} markToday />
                                <h2 className="px-1 text-lg font-bold text-ink">
                                    {t(`diet.days.long.${day}`)}
                                    {day === todayIndex() && (
                                        <span className="ml-2 text-sm font-semibold text-muted">({t('diet.today')})</span>
                                    )}
                                </h2>
                            </>
                        )}

                        <DayMenu meals={meals} />

                        {plan.notes && (
                            <div className="flex gap-3 rounded-3xl bg-card p-5 text-sm text-ink shadow-soft">
                                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                <p className="whitespace-pre-line">{plan.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </PageBody>
        </>
    )
}

export default MenuPage
