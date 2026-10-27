import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { addClientWeight, addMyWeight, getClientWeights, getMyWeights } from '../services/weightService'
import { toErrorMessage } from '../services/errorMessage'
import WeightForm from './WeightForm'
import type { CreateWeightEntryRequest, WeightEntry } from '../types/weight'

type WeightSectionProps = {
    clientId?: number
}

function WeightSection({ clientId }: WeightSectionProps) {
    const { t, i18n } = useTranslation()

    const [entries, setEntries] = useState<WeightEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Hangi adrese gidileceğine clientId karar veriyor
    const loadFromApi = () =>
        clientId === undefined ? getMyWeights() : getClientWeights(clientId)

    const addToApi = (request: CreateWeightEntryRequest) =>
        clientId === undefined ? addMyWeight(request) : addClientWeight(clientId, request)

    useEffect(() => {
        async function loadEntries() {
            try {
                setEntries(await loadFromApi())
            } catch (error) {
                setError(toErrorMessage(error, t, 'weights.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadEntries()
        // loadFromApi her render'da yeniden oluşur; listeye eklersek sonsuz döngü olur
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t, clientId])

    const handleAdd = async (request: CreateWeightEntryRequest) => {
        await addToApi(request)
        setEntries(await loadFromApi())
    }

    // "2026-10-20" → Türkçede "20.10.2026", İngilizcede "10/20/2026"
    function formatDate(date: string): string {
        return new Date(`${date}T00:00:00`).toLocaleDateString(i18n.language)
    }

    return (
        <section className="mt-8 rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-slate-900">
                {t('weights.title')}
            </h2>

            <WeightForm onSubmit={handleAdd} />

            {loading && (
                <p className="mt-4 text-slate-500">{t('dashboard.loading')}</p>
            )}

            {error && <p className="mt-4 text-red-600">{error}</p>}

            {!loading && !error && entries.length === 0 && (
                <p className="mt-4 text-slate-500">{t('weights.empty')}</p>
            )}

            {!loading && !error && entries.length > 0 && (
                <ul className="mt-4 divide-y divide-slate-100">
                    {entries.map((entry) => (
                        <li key={entry.id} className="flex justify-between py-2">
                            <span className="text-slate-600">
                                {formatDate(entry.measuredOn)}
                                <span className="ml-2 text-xs text-slate-400">
                                    {entry.enteredBy}
                                </span>
                            </span>
                            <span className="font-medium text-slate-900">
                                {entry.weightKg.toLocaleString(i18n.language)} kg
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default WeightSection