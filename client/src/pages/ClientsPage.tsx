import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'

import { PageBody, PageHero } from '../components/PageLayout'
import { getUsers } from '../services/userService'
import { toErrorMessage } from '../services/errorMessage'
import type { UserResponse } from '../types/auth'

// Diyetisyenin danışan listesi
function ClientsPage() {
    const { t } = useTranslation()

    const [clients, setClients] = useState<UserResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadClients() {
            try {
                const users = await getUsers()
                // Listede yalnızca danışanlar; diyetisyenler gösterilmez
                setClients(users.filter((user) => user.role === 'CLIENT'))
            } catch (error) {
                setError(toErrorMessage(error, t, 'users.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadClients()
    }, [t])

    return (
        <>
            <PageHero>
                <h1 className="text-3xl font-extrabold tracking-tight">{t('nav.clients')}</h1>
                {!loading && !error && (
                    <p className="mt-1 text-sm text-mint">{t('clients.count', { count: clients.length })}</p>
                )}
            </PageHero>

            <PageBody>
                <section className="rounded-2xl bg-card p-2 shadow-sm">
                    {loading && <p className="p-4 text-muted">{t('dashboard.loading')}</p>}

                    {error && <p className="p-4 text-red-700">{error}</p>}

                    {!loading && !error && clients.length === 0 && (
                        <p className="p-4 text-muted">{t('clients.empty')}</p>
                    )}

                    {!loading && !error && clients.length > 0 && (
                        <ul className="divide-y divide-line">
                            {clients.map((client) => (
                                <li key={client.id}>
                                    <Link
                                        to={`/clients/${client.id}`}
                                        className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-cream"
                                    >
                                        {/* Adın baş harfi, yuvarlak rozet içinde */}
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-cream">
                                            {client.username.charAt(0).toLocaleUpperCase('tr')}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block font-semibold text-ink">{client.username}</span>
                                            <span className="block truncate text-sm text-muted">{client.email}</span>
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-muted" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </PageBody>
        </>
    )
}

export default ClientsPage
