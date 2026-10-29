import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarDays, ChevronRight, Flag, Salad, Scale, Trophy, TrendingDown, type LucideIcon } from 'lucide-react'

import { PageBody, PageHero } from '../components/PageLayout'
import WeightSection from '../components/WeightSection'
import { getMyDietPlan } from '../services/dietService'
import { toErrorMessage } from '../services/errorMessage'
import { getRole, getUsername } from '../services/session'
import { MEAL_DOT_COLORS, mealsOfDay, todayIndex } from '../diet/dietUtils'
import { formatKg } from '../utils/format'
import type { DietPlan } from '../types/diet'
import type { WeightSummary } from '../types/weight'
import { usePageTitle } from '../hooks/usePageTitle'

type Tile = {
    icon: LucideIcon
    // Kutucuğun simge zemini
    tone: string
    value: string
    // Kilo değişimi mi (yeşil/kırmızı renk alır) yoksa düz bilgi mi
    change: number | null
    label: string
}

// Danışanın ana sayfası: başlıkta güncel kilo ve başarı rozeti, kutucuklar, bugünün menüsü, kilo takibi
function DashboardPage() {
    const { t, i18n } = useTranslation()
    usePageTitle(t('nav.home'))
    const [summary, setSummary] = useState<WeightSummary | null>(null)
    const [plan, setPlan] = useState<DietPlan | undefined>(undefined)
    // Menü yüklenemezse ana sayfa yine çalışır; kartta hata gösterilir (ham hata, ekranda çevrilir)
    const [menuError, setMenuError] = useState<unknown>(null)

    useEffect(() => {
        if (getRole() === 'DIETITIAN') {
            return
        }
        let cancelled = false
        getMyDietPlan()
            .then((result) => {
                if (!cancelled) {
                    setPlan(result)
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setMenuError(error)
                }
            })
        return () => {
            cancelled = true
        }
    }, [])

    // Diyetisyenin ana sayfası danışan listesi
    if (getRole() === 'DIETITIAN') {
        return <Navigate to="/clients" replace />
    }

    const latest = summary?.latestWeightKg ?? null
    const change = summary?.changeSinceStartKg ?? null
    const kg = (value: number | null, signed = false) => (value === null ? '—' : formatKg(value, i18n.language, signed))

    const tiles: Tile[] = [
        { icon: TrendingDown, tone: 'bg-peach text-peach-ink', value: kg(summary?.changeLast7DaysKg ?? null, true), change: summary?.changeLast7DaysKg ?? null, label: t('home.days7') },
        { icon: CalendarDays, tone: 'bg-lilac text-lilac-ink', value: kg(summary?.changeLast30DaysKg ?? null, true), change: summary?.changeLast30DaysKg ?? null, label: t('home.days30') },
        { icon: Flag, tone: 'bg-sky text-sky-ink', value: kg(summary?.startWeightKg ?? null), change: null, label: t('home.start') },
    ]

    const changeColor = (value: number | null) => {
        if (value === null || value === 0) {
            return 'text-ink'
        }
        return value < 0 ? 'text-brand' : 'text-danger'
    }

    const todaysMeals = plan ? mealsOfDay(plan.meals, plan.planType === 'DAILY' ? 0 : todayIndex()) : []

    return (
        <>
            <PageHero>
                <p className="text-lg font-semibold text-cream/95">{t('home.greeting', { name: getUsername() })}</p>
                {/* Henüz kilo yoksa büyük sayı yerine boşluk: karşılama kartı ilk adımı anlatır */}
                {latest !== null && <p className="mt-1 text-5xl font-extrabold tracking-tight">{formatKg(latest, i18n.language)}</p>}
                {change !== null && change < 0 && (
                    // Kilo verdiyse parlayan altın rozet
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-ink shine-gold">
                        <Trophy className="h-3.5 w-3.5" />
                        {t('home.sinceStartBadge', { value: formatKg(change, i18n.language, true) })}
                    </span>
                )}
                {change !== null && change >= 0 && (
                    <span className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                        {t('home.sinceStartBadge', { value: formatKg(change, i18n.language, true) })}
                    </span>
                )}
            </PageHero>

            <PageBody>
                {/* Yeni danışan: henüz kilo yok → kutucuklar yerine karşılama ve ilk adım */}
                {summary !== null && latest === null ? (
                    <div className="mb-4 flex items-center gap-4 rounded-3xl bg-card p-5 shadow-soft">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-peach text-peach-ink">
                            <Scale className="h-6 w-6" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block font-bold text-ink">{t('home.welcomeTitle')}</span>
                            <span className="block text-sm text-muted">{t('home.welcomeText')}</span>
                        </span>
                        <a href="#kilo" className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream shadow-soft">
                            {t('home.welcomeCta')}
                        </a>
                    </div>
                ) : (
                    <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
                        {tiles.map((tile) => {
                            const Icon = tile.icon
                            return (
                                <div
                                    key={tile.label}
                                    className="rounded-3xl bg-card p-3 shadow-soft transition hover:-translate-y-1 sm:p-4"
                                >
                                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tile.tone}`}>
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <p className={`mt-2 text-base font-extrabold tracking-tight sm:text-xl ${changeColor(tile.change)}`}>
                                        {tile.value}
                                    </p>
                                    <p className="text-xs text-muted">{tile.label}</p>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Bugünün menüsü: öğün adları ve saatleri; ayrıntı "Menüm" sekmesinde */}
                <Link
                    to="/menu"
                    className="mb-4 block rounded-3xl bg-card p-5 shadow-soft transition hover:-translate-y-0.5"
                >
                    <span className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-bold text-ink">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage text-brand">
                                <Salad className="h-4 w-4" />
                            </span>
                            {t('home.todayMenu')}
                        </span>
                        <span className="flex items-center text-sm font-semibold text-brand">
                            {t('home.seeAll')}
                            <ChevronRight className="h-4 w-4" />
                        </span>
                    </span>
                    {todaysMeals.length > 0 ? (
                        <span className="mt-2 block divide-y divide-dashed divide-line">
                            {todaysMeals.map((meal, index) => (
                                <span key={`${meal.dayIndex}-${meal.position}`} className="flex items-center gap-3 py-2.5">
                                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${MEAL_DOT_COLORS[index % MEAL_DOT_COLORS.length]}`} />
                                    <span className="text-ink">{meal.name}</span>
                                    {meal.time && <span className="ml-auto text-sm text-muted">{meal.time}</span>}
                                </span>
                            ))}
                        </span>
                    ) : menuError !== null ? (
                        <span className="mt-2 block text-sm text-danger">{toErrorMessage(menuError, t, 'diet.loadError')}</span>
                    ) : (
                        <span className="mt-2 block text-sm text-muted">{t('home.noMenu')}</span>
                    )}
                </Link>

                {/* "Kilomu gir" düğmesi buraya kaydırır */}
                <div id="kilo" className="scroll-mt-4">
                    <WeightSection onSummaryChange={setSummary} showSummaryCards={false} />
                </div>
            </PageBody>
        </>
    )
}

export default DashboardPage
