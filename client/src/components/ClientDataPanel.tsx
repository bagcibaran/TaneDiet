import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, FileText, ShieldCheck, Trash2 } from 'lucide-react'

import { useFeedback } from './feedback/useFeedback'
import { SkeletonCard } from './Skeleton'
import { deleteClient, getAccessLog } from '../services/clientDataService'
import { toErrorMessage } from '../services/errorMessage'
import { formatDateTime } from '../utils/format'
import type { UserResponse } from '../types/auth'
import type { AccessLogEntry } from '../types/clientData'

type ClientDataPanelProps = {
    client: UserResponse
}

// Danışan sayfasındaki "Veriler ve KVKK" kartı: dışa aktarma, kalıcı silme (WhatsApp'tan gelen talep üzerine)
// ve diyetisyenin sağlık bilgilerini ne zaman görüntülediğini gösteren kayıt
function ClientDataPanel({ client }: ClientDataPanelProps) {
    const { t, i18n } = useTranslation()
    const { toast, confirm } = useFeedback()
    const navigate = useNavigate()

    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<unknown>(null)
    const [logOpen, setLogOpen] = useState(false)
    // null: henüz yüklenmedi (kayıt ilk açılışta yüklenir)
    const [log, setLog] = useState<AccessLogEntry[] | null>(null)
    const [logError, setLogError] = useState<unknown>(null)

    const toggleLog = () => {
        const opening = !logOpen
        setLogOpen(opening)
        if (opening && log === null) {
            setLogError(null)
            getAccessLog(client.id).then(setLog).catch(setLogError)
        }
    }

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: t('clientData.deleteTitle', { username: client.username }),
            message: t('clientData.deleteMessage'),
            confirmLabel: t('clientData.deleteConfirm'),
            danger: true,
            requireText: client.username,
        })
        if (!confirmed) {
            return
        }
        setDeleting(true)
        setDeleteError(null)
        try {
            await deleteClient(client.id, client.username)
            toast(t('clientData.deleted'))
            navigate('/clients', { replace: true })
        } catch (error) {
            setDeleteError(error)
            setDeleting(false)
        }
    }

    return (
        <section className="mb-4 rounded-3xl bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lilac text-lilac-ink">
                    <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 className="font-bold text-ink">{t('clientData.title')}</h2>
            </div>
            <p className="mt-2 text-sm text-muted">{t('clientData.hint')}</p>

            <div className="mt-4 flex flex-wrap gap-2">
                <Link
                    to={`/clients/${client.id}/export`}
                    className="flex items-center justify-center gap-1 rounded-full border border-line bg-cream px-3 py-2 text-sm font-semibold text-brand transition hover:border-brand"
                >
                    <FileText className="h-4 w-4" />
                    {t('clientData.export')}
                </Link>
                <button
                    type="button"
                    disabled={deleting}
                    onClick={() => void handleDelete()}
                    className="flex items-center justify-center gap-1 rounded-full border border-danger/30 bg-cream px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger-soft disabled:opacity-50"
                >
                    <Trash2 className="h-4 w-4" />
                    {t('clientData.delete')}
                </button>
            </div>

            {deleteError !== null && (
                <p className="mt-3 text-sm text-danger">{toErrorMessage(deleteError, t, 'clientData.deleteError')}</p>
            )}

            {/* Görüntüleme kaydı: kapalı başlar, açılınca yüklenir */}
            <button
                type="button"
                onClick={toggleLog}
                aria-expanded={logOpen}
                className="mt-4 flex w-full items-center justify-between rounded-2xl bg-cream px-4 py-3 text-sm font-semibold text-ink"
            >
                {t('clientData.accessLog')}
                <ChevronDown className={`h-4 w-4 text-muted transition ${logOpen ? 'rotate-180' : ''}`} />
            </button>

            {logOpen && (
                <div className="mt-2 px-1">
                    {log === null && logError === null && <SkeletonCard bare lines={2} label={t('common.loading')} />}
                    {logError !== null && (
                        <p className="text-sm text-danger">{toErrorMessage(logError, t, 'clientData.accessLogError')}</p>
                    )}
                    {log !== null && log.length === 0 && <p className="text-sm text-muted">{t('clientData.accessLogEmpty')}</p>}
                    {log !== null && log.length > 0 && (
                        <ul className="divide-y divide-line text-sm">
                            {log.map((entry, index) => (
                                <li key={index} className="py-2">
                                    <p className="text-ink">{t(`clientData.actions.${entry.action}`)}</p>
                                    <p className="text-xs text-muted">
                                        {entry.viewer} · {formatDateTime(entry.createdAt, i18n.language)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </section>
    )
}

export default ClientDataPanel
