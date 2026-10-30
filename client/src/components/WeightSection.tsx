import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'

import {
    addClientWeight,
    addMyWeight,
    deleteClientWeight,
    deleteMyWeight,
    getClientWeights,
    getClientWeightSummary,
    getMyWeights,
    getMyWeightSummary,
} from '../services/weightService'
import { toErrorMessage } from '../services/errorMessage'
import { getUsername } from '../services/session'
import { formatKg } from '../utils/format'
import WeightForm from './WeightForm'
import { useFeedback } from './feedback/useFeedback'
import { SkeletonCard } from './Skeleton'
import WeightSummaryCards from './WeightSummaryCards'
import WeightChart from './WeightChart'
import type { CreateWeightEntryRequest, WeightEntry, WeightSummary } from '../types/weight'

type WeightSectionProps = {
    // Verilirse diyetisyen o danışanın kilolarını yönetir; verilmezse danışan kendi kilolarını
    clientId?: number
    // Özet her yüklendiğinde çağrılır (sayfa başlığında güncel kiloyu göstermek için)
    onSummaryChange?: (summary: WeightSummary) => void
    // Diyetisyen son baktığından beri danışanın girdiği kayıtlar: "Yeni" etiketiyle işaretlenir
    highlightIds?: number[]
    // false: 7/30 gün kartları gösterilmez (danışan ana sayfası bunları en üstte kutucuk olarak gösteriyor)
    showSummaryCards?: boolean
}

function WeightSection({ clientId, onSummaryChange, highlightIds = [], showSummaryCards = true }: WeightSectionProps) {
    const { t, i18n } = useTranslation()
    const { toast, confirm } = useFeedback()
    const currentUsername = getUsername()

    const [entries, setEntries] = useState<WeightEntry[]>([])
    const [summary, setSummary] = useState<WeightSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    // Silme başarısız olursa gösterilecek mesaj (liste görünmeye devam etsin diye ayrı)
    const [actionError, setActionError] = useState('')

    // Hangi adrese gidileceğine clientId karar veriyor
    const loadEntriesFromApi = () =>
        clientId === undefined ? getMyWeights() : getClientWeights(clientId)

    const loadSummaryFromApi = () =>
        clientId === undefined ? getMyWeightSummary() : getClientWeightSummary(clientId)

    const addToApi = (request: CreateWeightEntryRequest) =>
        clientId === undefined ? addMyWeight(request) : addClientWeight(clientId, request)

    const deleteFromApi = (entryId: number) =>
        clientId === undefined ? deleteMyWeight(entryId) : deleteClientWeight(clientId, entryId)

    // Liste ve özeti birlikte (aynı anda) yeniden yükler
    const reload = async () => {
        const [newEntries, newSummary] = await Promise.all([
            loadEntriesFromApi(),
            loadSummaryFromApi(),
        ])
        setEntries(newEntries)
        setSummary(newSummary)
        onSummaryChange?.(newSummary)
    }

    // Diyetisyen her kaydı silebilir; danışan yalnızca kendi girdiğini (backend ile aynı kural)
    const canDelete = (entry: WeightEntry) =>
        clientId !== undefined || entry.enteredBy === currentUsername

    useEffect(() => {
        async function loadInitial() {
            try {
                await reload()
            } catch (error) {
                setError(toErrorMessage(error, t, 'weights.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadInitial()
        // reload her render'da yeniden oluşur; listeye eklersek sonsuz döngü olur
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t, clientId])

    const handleAdd = async (request: CreateWeightEntryRequest) => {
        await addToApi(request)
        await reload()
        toast(t('weights.added'))
    }

    const handleDelete = async (entry: WeightEntry) => {
        if (!(await confirm({ title: t('weights.confirmDelete'), confirmLabel: t('common.delete'), danger: true }))) {
            return
        }

        setActionError('')
        try {
            await deleteFromApi(entry.id)
            await reload()
            toast(t('common.deleted'))
        } catch (error) {
            setActionError(toErrorMessage(error, t, 'weights.deleteError'))
        }
    }

    // "2026-10-20" → Türkçede "20.10.2026", İngilizcede "10/20/2026"
    function formatDate(date: string): string {
        return new Date(`${date}T00:00:00`).toLocaleDateString(i18n.language)
    }

    return (
        <section className="mb-4 rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="text-lg font-bold text-ink">{t('weights.title')}</h2>

            {showSummaryCards && summary && summary.points.length > 0 && (
                <WeightSummaryCards summary={summary} />
            )}

            {summary && summary.points.length > 1 && (
                <WeightChart points={summary.points} />
            )}

            <WeightForm onSubmit={handleAdd} />

            {actionError && (
                <p className="mt-4 text-sm text-danger">{actionError}</p>
            )}

            {loading && (
                <SkeletonCard bare lines={4} label={t('dashboard.loading')} />
            )}

            {error && <p className="mt-4 text-danger">{error}</p>}

            {!loading && !error && entries.length === 0 && (
                <p className="mt-4 text-muted">{t('weights.empty')}</p>
            )}

            {!loading && !error && entries.length > 0 && (
                <ul className="mt-4 divide-y divide-line">
                    {entries.map((entry) => (
                        <li
                            key={entry.id}
                            className={`flex items-center justify-between gap-3 py-3 ${
                                highlightIds.includes(entry.id) ? '-mx-2 rounded-lg bg-mint/30 px-2' : ''
                            }`}
                        >
                            <span className="text-muted">
                                {formatDate(entry.measuredOn)}
                                {/* Kim girdi: kullanıcı adı yerine "Sen" / "Diyetisyenin" / "Danışan" */}
                                <span className="ml-2 text-xs text-muted/70">
                                    {entry.enteredBy === currentUsername
                                        ? t('weights.byYou')
                                        : clientId !== undefined
                                          ? t('weights.byClient')
                                          : t('weights.byDietitian')}
                                </span>
                                {highlightIds.includes(entry.id) && (
                                    <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[0.65rem] font-semibold text-cream">
                                        {t('weights.new')}
                                    </span>
                                )}
                            </span>

                            <span className="ml-auto font-semibold text-ink">
                                {formatKg(entry.weightKg, i18n.language)}
                            </span>

                            {canDelete(entry) ? (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(entry)}
                                    aria-label={t('weights.delete')}
                                    className="rounded-full p-2.5 text-danger hover:bg-danger-soft"
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