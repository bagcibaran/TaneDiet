import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

import { PageBody, PageHero } from '../components/PageLayout'
import WeightSection from '../components/WeightSection'
import IntakeSummary from '../components/intake/IntakeSummary'
import AccessPanel from '../components/AccessPanel'
import ClientDataPanel from '../components/ClientDataPanel'
import DietPlanSection from '../components/diet/DietPlanSection'
import { getClient, getClientActivity, markClientReviewed } from '../services/clientService'
import { formatKg } from '../utils/format'
import type { UserResponse } from '../types/auth'
import type { ClientActivity } from '../types/client'
import type { WeightSummary } from '../types/weight'
import { usePageTitle } from '../hooks/usePageTitle'

// Diyetisyenin bir danışanı yönettiği sayfa: /clients/:id
function ClientDetailPage() {
    const { t, i18n } = useTranslation()

    // Adresteki :id parçası. /clients/41 → id = "41" (yazı olarak gelir)
    const { id } = useParams()
    const clientId = Number(id)

    const [client, setClient] = useState<UserResponse | null>(null)
    usePageTitle(client?.username)
    const [summary, setSummary] = useState<WeightSummary | null>(null)
    // Diyetisyen son baktığından beri neler yeni (sayfada işaretlemek için)
    const [activity, setActivity] = useState<ClientActivity | null>(null)

    // Sayfa başlığında danışanın adını göstermek için
    useEffect(() => {
        if (Number.isNaN(clientId)) {
            return
        }
        let cancelled = false
        getClient(clientId)
            .then((result) => {
                if (!cancelled) {
                    setClient(result)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setClient(null)
                }
            })
        return () => {
            cancelled = true
        }
    }, [clientId])

    // Önce neyin yeni olduğunu al, sonra "görüldü" yap. Sıra önemli: önce görüldü yapılırsa yeniler kaybolur.
    useEffect(() => {
        if (Number.isNaN(clientId)) {
            return
        }

        let cancelled = false
        getClientActivity(clientId)
            .then((result) => {
                // StrictMode efekti iki kez çalıştırır; iptal edilen ilk çalışma "görüldü" yapmasın
                if (cancelled) {
                    return
                }
                setActivity(result)
                return markClientReviewed(clientId)
            })
            .catch(() => {
                // Bildirimler yalnızca yardımcı bilgi; alınamazsa sayfa yine çalışır
            })

        return () => {
            cancelled = true
        }
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
                <IntakeSummary
                    clientId={clientId}
                    intakeStatus={activity?.intakeStatus}
                    changedFields={activity?.changedFields ?? []}
                />
                <DietPlanSection clientId={clientId} />
                <WeightSection
                    clientId={clientId}
                    onSummaryChange={setSummary}
                    highlightIds={activity?.newWeightEntryIds ?? []}
                />
                {/* Hizmet süresi ve KVKK (dışa aktarma, kalıcı silme, görüntüleme kaydı) en altta */}
                <AccessPanel clientId={clientId} />
                {client && <ClientDataPanel client={client} />}
            </PageBody>
        </>
    )
}

export default ClientDetailPage
