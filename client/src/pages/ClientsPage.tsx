import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, CircleCheck, Link2, Search } from 'lucide-react'

import { PageBody, PageHero } from '../components/PageLayout'
import InvitePanel from '../components/invites/InvitePanel'
import { inputClass } from '../components/ui'
import { getClients } from '../services/clientService'
import { toErrorMessage } from '../services/errorMessage'
import type { ClientOverview } from '../types/client'

// Diyetisyenin danışan listesi: arama + her kartta bildirimler
function ClientsPage() {
    const { t } = useTranslation()

    const [clients, setClients] = useState<ClientOverview[]>([])
    const [loading, setLoading] = useState(true)
    // Ham hata saklanır, mesaj ekrana çizilirken çevrilir
    const [error, setError] = useState<unknown>(null)
    const [query, setQuery] = useState('')
    const [inviteOpen, setInviteOpen] = useState(false)
    const closeInvite = useCallback(() => setInviteOpen(false), [])

    useEffect(() => {
        getClients()
            .then(setClients)
            .catch(setError)
            .finally(() => setLoading(false))
    }, [])

    // Arama: kullanıcı adında veya e-postada geçen danışanlar (Türkçe büyük/küçük harf: İ/i, I/ı)
    const normalizedQuery = query.trim().toLocaleLowerCase('tr')
    const visibleClients = clients.filter(
        (client) =>
            client.username.toLocaleLowerCase('tr').includes(normalizedQuery) ||
            client.email.toLocaleLowerCase('tr').includes(normalizedQuery),
    )

    // Kartta gösterilecek bildirimler (boşsa kart sade görünür). Hizmet süresi rozetleri ayrı renkte.
    const badgesOf = (client: ClientOverview): { label: string; tone: string }[] => {
        const news = 'bg-mint/40 text-brand'
        const badges: { label: string; tone: string }[] = []
        if (client.locked) {
            badges.push({ label: t('clients.badges.expired'), tone: 'bg-coral/20 text-ink' })
        } else if (client.daysLeft !== null && client.daysLeft <= 7) {
            badges.push({ label: t('clients.badges.daysLeft', { count: client.daysLeft }), tone: 'bg-peach text-peach-ink' })
        }
        if (client.intakeStatus === 'NEW') {
            badges.push({ label: t('clients.badges.newIntake'), tone: news })
        }
        if (client.intakeStatus === 'UPDATED') {
            badges.push({ label: t('clients.badges.intakeUpdated'), tone: news })
        }
        if (client.newWeightCount > 0) {
            badges.push({ label: t('clients.badges.newWeights', { count: client.newWeightCount }), tone: news })
        }
        return badges
    }

    // Köşedeki nokta yalnızca yeni bir şey varsa (hizmet süresi rozeti bildirim sayılmaz)
    const hasNews = (client: ClientOverview) =>
        client.intakeStatus === 'NEW' || client.intakeStatus === 'UPDATED' || client.newWeightCount > 0

    return (
        <>
            <PageHero>
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">{t('nav.clients')}</h1>
                        {!loading && error === null && (
                            <p className="mt-1 text-sm text-mint">{t('clients.count', { count: clients.length })}</p>
                        )}
                    </div>
                    {/* Ödeme yapan kişiye davet linki */}
                    <button
                        type="button"
                        onClick={() => setInviteOpen(true)}
                        className="flex shrink-0 items-center gap-1.5 rounded-full bg-honey px-4 py-2 text-sm font-bold text-ink shadow-soft transition hover:brightness-105 active:scale-[0.98]"
                    >
                        <Link2 className="h-4 w-4" />
                        {t('invites.open')}
                    </button>
                </div>
            </PageHero>

            <PageBody>
                {/* Arama çubuğu */}
                <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t('clients.search')}
                        aria-label={t('clients.search')}
                        className={`${inputClass} bg-card pl-10 shadow-soft`}
                    />
                </div>

                <section className="rounded-3xl bg-card p-2 shadow-soft">
                    {loading && <p className="p-4 text-muted">{t('dashboard.loading')}</p>}

                    {error !== null && <p className="p-4 text-red-700">{toErrorMessage(error, t, 'users.loadError')}</p>}

                    {!loading && error === null && clients.length === 0 && (
                        <p className="p-4 text-muted">{t('clients.empty')}</p>
                    )}

                    {!loading && error === null && clients.length > 0 && visibleClients.length === 0 && (
                        <p className="p-4 text-muted">{t('clients.noMatch')}</p>
                    )}

                    {!loading && error === null && visibleClients.length > 0 && (
                        <ul className="divide-y divide-line">
                            {visibleClients.map((client) => {
                                const badges = badgesOf(client)
                                return (
                                    <li key={client.id}>
                                        <Link
                                            to={`/clients/${client.id}`}
                                            className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-cream"
                                        >
                                            {/* Adın baş harfi; yeni bir şey varsa köşesinde yeşil nokta */}
                                            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-cream">
                                                {client.username.charAt(0).toLocaleUpperCase('tr')}
                                                {hasNews(client) && (
                                                    <span
                                                        className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-honey"
                                                        aria-label={t('clients.badges.hasNews')}
                                                    />
                                                )}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-1 font-semibold text-ink">
                                                    {client.username}
                                                    {/* Diyet programı yazılmış danışan */}
                                                    {client.hasPlan && (
                                                        <CircleCheck
                                                            className="h-4 w-4 text-brand"
                                                            aria-label={t('clients.hasPlan')}
                                                        />
                                                    )}
                                                </span>
                                                <span className="block truncate text-sm text-muted">{client.email}</span>
                                                {badges.length > 0 && (
                                                    <span className="mt-1 flex flex-wrap gap-1">
                                                        {badges.map((badge) => (
                                                            <span
                                                                key={badge.label}
                                                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.tone}`}
                                                            >
                                                                {badge.label}
                                                            </span>
                                                        ))}
                                                    </span>
                                                )}
                                            </span>
                                            <ChevronRight className="h-5 w-5 text-muted" />
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </section>
            </PageBody>

            {inviteOpen && <InvitePanel onClose={closeInvite} />}
        </>
    )
}

export default ClientsPage
