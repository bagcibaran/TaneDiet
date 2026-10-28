import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { PageBody, PageHero } from '../components/PageLayout'
import LanguageToggle from '../components/LanguageToggle'
import WeightSection from '../components/WeightSection'
import { getRole, getUsername } from '../services/session'
import { formatKg } from '../utils/format'
import type { WeightSummary } from '../types/weight'

// Danışanın ana sayfası: başlıkta güncel kilo, altında kilo takibi
function DashboardPage() {
    const { t, i18n } = useTranslation()
    const [summary, setSummary] = useState<WeightSummary | null>(null)

    // Diyetisyenin ana sayfası danışan listesi
    if (getRole() === 'DIETITIAN') {
        return <Navigate to="/clients" replace />
    }

    const latest = summary?.latestWeightKg ?? null
    const change = summary?.changeSinceStartKg ?? null

    return (
        <>
            <PageHero aside={<LanguageToggle />}>
                <p className="text-sm text-mint">{t('home.greeting', { name: getUsername() })}</p>
                <p className="mt-1 text-5xl font-extrabold tracking-tight">
                    {latest !== null ? formatKg(latest, i18n.language) : '—'}
                </p>
                {change !== null && (
                    <p className="mt-1 text-sm text-mint">
                        {t('home.sinceStart', { value: formatKg(change, i18n.language, true) })}
                    </p>
                )}
            </PageHero>

            <PageBody>
                <WeightSection onSummaryChange={setSummary} />
            </PageBody>
        </>
    )
}

export default DashboardPage
