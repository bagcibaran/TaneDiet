import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarClock, Infinity as InfinityIcon, Lock, Plus } from 'lucide-react'

import { inputClass } from './ui'
import { getClientAccess, updateClientAccess } from '../services/accessService'
import { toErrorMessage } from '../services/errorMessage'
import { PACKAGE_MONTHS, type ClientAccess, type ClientAccessRequest } from '../types/access'

type AccessPanelProps = {
    clientId: number
}

// Diyetisyenin danışan sayfasındaki "Hizmet süresi" kartı: durum + paket ekle, tarih ayarla, süresiz yap, hemen kapat
function AccessPanel({ clientId }: AccessPanelProps) {
    const { t, i18n } = useTranslation()

    const [access, setAccess] = useState<ClientAccess | null>(null)
    const [date, setDate] = useState('')
    const [busy, setBusy] = useState(false)
    // Ham hata saklanır, mesaj ekrana çizilirken çevrilir
    const [error, setError] = useState<unknown>(null)

    useEffect(() => {
        let cancelled = false
        getClientAccess(clientId)
            .then((result) => {
                if (!cancelled) {
                    setAccess(result)
                    setDate(result.accessUntil ?? '')
                }
            })
            .catch((caught) => {
                if (!cancelled) {
                    setError(caught)
                }
            })
        return () => {
            cancelled = true
        }
    }, [clientId])

    const apply = async (request: ClientAccessRequest) => {
        setBusy(true)
        setError(null)
        try {
            const result = await updateClientAccess(clientId, request)
            setAccess(result)
            setDate(result.accessUntil ?? '')
        } catch (caught) {
            setError(caught)
        } finally {
            setBusy(false)
        }
    }

    const closeNow = () => {
        if (window.confirm(t('access.confirmClose'))) {
            void apply({ action: 'CLOSE_NOW' })
        }
    }

    const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString(i18n.language)

    // Durum satırı ve rengi
    let status = ''
    let statusClass = 'bg-sage text-brand'
    if (access) {
        if (access.locked) {
            status = t('access.locked', { date: formatDate(access.accessUntil ?? '') })
            statusClass = 'bg-coral/20 text-ink'
        } else if (access.accessUntil === null) {
            status = t('access.unlimited')
        } else {
            status = t('access.until', { date: formatDate(access.accessUntil), count: access.daysLeft ?? 0 })
            if ((access.daysLeft ?? 0) <= 7) {
                statusClass = 'bg-peach text-peach-ink'
            }
        }
    }

    const smallButton =
        'flex items-center justify-center gap-1 rounded-full border border-line bg-cream px-3 py-2 text-sm font-semibold text-brand transition hover:border-brand disabled:opacity-50'

    return (
        <section className="mb-4 rounded-3xl bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky text-sky-ink">
                    <CalendarClock className="h-5 w-5" />
                </span>
                <h2 className="font-bold text-ink">{t('access.title')}</h2>
            </div>

            {access === null && error === null && <p className="mt-3 text-muted">{t('dashboard.loading')}</p>}

            {access && (
                <>
                    <p className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusClass}`}>{status}</p>

                    {/* Paket ekle: kilitli/süresizse bugünden, açıksa mevcut son günden uzatır */}
                    <p className="mt-4 text-xs font-semibold text-muted">{t('access.addPackage')}</p>
                    <div className="mt-1 flex gap-2">
                        {PACKAGE_MONTHS.map((months) => (
                            <button
                                key={months}
                                type="button"
                                disabled={busy}
                                onClick={() => void apply({ action: 'ADD_MONTHS', months })}
                                className={`flex-1 ${smallButton}`}
                            >
                                <Plus className="h-4 w-4" />
                                {t('access.months', { count: months })}
                            </button>
                        ))}
                    </div>

                    {/* Bitiş tarihini elle ayarla (düzeltmek veya kısaltmak için) */}
                    <p className="mt-4 text-xs font-semibold text-muted">{t('access.setDate')}</p>
                    <div className="mt-1 flex gap-2">
                        <div className="min-w-0 flex-1">
                            <input
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                aria-label={t('access.setDate')}
                                className={`${inputClass} py-2`}
                            />
                        </div>
                        <button
                            type="button"
                            disabled={busy || date === ''}
                            onClick={() => void apply({ action: 'SET_DATE', date })}
                            className={smallButton}
                        >
                            {t('access.save')}
                        </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            disabled={busy || access.accessUntil === null}
                            onClick={() => void apply({ action: 'UNLIMITED' })}
                            className={smallButton}
                        >
                            <InfinityIcon className="h-4 w-4" />
                            {t('access.makeUnlimited')}
                        </button>
                        <button
                            type="button"
                            disabled={busy || access.locked}
                            onClick={closeNow}
                            className="flex items-center justify-center gap-1 rounded-full border border-red-200 bg-cream px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        >
                            <Lock className="h-4 w-4" />
                            {t('access.closeNow')}
                        </button>
                    </div>
                </>
            )}

            {error !== null && <p className="mt-3 text-sm text-red-700">{toErrorMessage(error, t, 'access.error')}</p>}
        </section>
    )
}

export default AccessPanel
