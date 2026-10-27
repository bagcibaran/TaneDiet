import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

import { PageBody, PageHero } from '../components/PageLayout'
import WeightSection from '../components/WeightSection'
import { getUsers } from '../services/userService'
import { formatKg } from '../utils/format'
import type { UserResponse } from '../types/auth'
import type { WeightSummary } from '../types/weight'

// Diyetisyenin bir danışanı yönettiği sayfa: /clients/:id
function ClientDetailPage() {
    const { t, i18n } = useTranslation()

    // Adresteki :id parçası. /clients/41 → id = "41" (yazı olarak gelir)
    const { id } = useParams()
    const clientId = Number(id)

    const [client, setClient] = useState<UserResponse | null>(null)
    const [summary, setSummary] = useState<WeightSummary | null>(null)

    // Sayfa başlığında danışanın adını göstermek için
    useEffect(() => {
        getUsers()
            .then((users) => setClient(users.find((user) => user.id === clientId) ?? null))
            .catch(() => setClient(null))
    }, [clientId])

    // Adreste sayı yoksa (/clients/abc) listeye geri gönder
    if (Number.isNaN(clientId)) {
        return <Navigate to="/clients" replace />
    }

    const latest = summary?.latestWeightKg ?? null
    const change = summary?.changeSinceStartKg ?? null

    return (
        <>
            <PageHero>
                <Link
                    to="/clients"
                    className="inline-flex items-center gap-1 text-sm font-medium text-mint hover:text-cream"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('clients.back')}
                </Link>

                <h1 className="mt-2 text-2xl font-bold tracking-tight">
                    {client ? client.username : t('clients.title')}
                </h1>
                {client && <p className="text-sm text-mint">{client.email}</p>}

                <p className="mt-3 text-5xl font-extrabold tracking-tight">
                    {latest !== null ? formatKg(latest, i18n.language) : '—'}
                </p>
                {change !== null && (
                    <p className="mt-1 text-sm text-mint">
                        {t('home.sinceStart', { value: formatKg(change, i18n.language, true) })}
                    </p>
                )}
            </PageHero>

            <PageBody>
                <WeightSection clientId={clientId} onSummaryChange={setSummary} />
            </PageBody>
        </>
    )
}

export default ClientDetailPage