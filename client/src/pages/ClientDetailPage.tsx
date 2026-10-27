import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

import WeightSection from '../components/WeightSection'
import { getUsers } from '../services/userService'
import type { UserResponse } from '../types/auth'

// Diyetisyenin bir danışanı yönettiği sayfa: /clients/:id
function ClientDetailPage() {
    const { t } = useTranslation()

    // Adresteki :id parçası. /clients/41 → id = "41" (yazı olarak gelir)
    const { id } = useParams()
    const clientId = Number(id)

    const [client, setClient] = useState<UserResponse | null>(null)

    // Sayfa başlığında danışanın adını göstermek için
    useEffect(() => {
        getUsers()
            .then((users) => setClient(users.find((user) => user.id === clientId) ?? null))
            .catch(() => setClient(null))
    }, [clientId])

    // Adreste sayı yoksa (/clients/abc) listeye geri gönder
    if (Number.isNaN(clientId)) {
        return <Navigate to="/users" replace />
    }

    return (
        <main className="min-h-screen bg-slate-100 p-8">
            <div className="mx-auto max-w-6xl">
                <Link
                    to="/users"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('clients.back')}
                </Link>

                <h1 className="mt-4 text-3xl font-bold text-slate-900">
                    {client ? client.username : t('clients.title')}
                </h1>

                {client && <p className="mt-1 text-slate-500">{client.email}</p>}

                <WeightSection clientId={clientId} />
            </div>
        </main>
    )
}

export default ClientDetailPage