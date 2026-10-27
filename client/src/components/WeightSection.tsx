import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'

import {
    addClientWeight,
    addMyWeight,
    deleteClientWeight,
    deleteMyWeight,
    getClientWeights,
    getMyWeights,
} from '../services/weightService'
import { toErrorMessage } from '../services/errorMessage'
import { getUsername } from '../services/session'
import WeightForm from './WeightForm'
import type { CreateWeightEntryRequest, WeightEntry } from '../types/weight'

type WeightSectionProps = {
    // Verilirse diyetisyen o danışanın kilolarını yönetir; verilmezse danışan kendi kilolarını
    clientId?: number
}

function WeightSection({ clientId }: WeightSectionProps) {
    const { t, i18n } = useTranslation()
    const currentUsername = getUsername()

    const [entries, setEntries] = useState<WeightEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    // Silme başarısız olursa gösterilecek mesaj (liste görünmeye devam etsin diye ayrı)
    const [actionError, setActionError] = useState('')

    // Hangi adrese gidileceğine clientId karar veriyor
    const loadFromApi = () =>
        clientId === undefined ? getMyWeights() : getClientWeights(clientId)

    const addToApi = (request: CreateWeightEntryRequest) =>
        clientId === undefined ? addMyWeight(request) : addClientWeight(clientId, request)

    const deleteFromApi = (entryId: number) =>
        clientId === undefined ? deleteMyWeight(entryId) : deleteClientWeight(clientId, entryId)

    // Diyetisyen her kaydı silebilir; danışan yalnızca kendi girdiğini (backend ile aynı kural)
    const canDelete = (entry: WeightEntry) =>
        clientId !== undefined || entry.enteredBy === currentUsername

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

    const handleDelete = async (entry: WeightEntry) => {
        if (!window.confirm(t('weights.confirmDelete'))) {
            return
        }

        setActionError('')
        try {
            await deleteFromApi(entry.id)
            setEntries((current) => current.filter((item) => item.id !== entry.id))
        } catch (error) {
            setActionError(toErrorMessage(error, t, 'weights.deleteError'))
        }
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

            {actionError && (
                <p className="mt-4 text-sm text-red-600">{actionError}</p>
            )}

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
                        <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
                            <span className="text-slate-600">
                                {formatDate(entry.measuredOn)}
                                <span className="ml-2 text-xs text-slate-400">
                                    {entry.enteredBy}
                                </span>
                            </span>

                            <span className="ml-auto font-medium text-slate-900">
                                {entry.weightKg.toLocaleString(i18n.language)} kg
                            </span>

                            {canDelete(entry) ? (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(entry)}
                                    aria-label={t('weights.delete')}
                                    className="rounded-md p-2 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            ) : (
                                // Buton yokken de kilo değerleri hizalı kalsın diye aynı genişlikte boşluk
                                <span className="w-8" />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default WeightSection