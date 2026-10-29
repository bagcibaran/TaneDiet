import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Link2, MessageCircle, Trash2, X } from 'lucide-react'

import { inputClass, labelClass, primaryButtonClass } from '../ui'
import { createInvite, deleteInvite, getOpenInvites, inviteLink } from '../../services/inviteService'
import { toErrorMessage } from '../../services/errorMessage'
import { whatsappShareLink } from '../../utils/whatsapp'
import { PACKAGE_MONTHS } from '../../types/access'
import type { Invite } from '../../types/invite'

type InvitePanelProps = {
    onClose: () => void
}

// Diyetisyenin davet penceresi (alttan açılır): paket seç, link oluştur, kopyala / WhatsApp'ta paylaş, açık davetler
function InvitePanel({ onClose }: InvitePanelProps) {
    const { t, i18n } = useTranslation()

    const [months, setMonths] = useState<number>(3)
    const [note, setNote] = useState('')
    const [created, setCreated] = useState<Invite | null>(null)
    // Son kopyalanan linkin token'ı ("Kopyalandı" yalnızca onda görünür)
    const [copiedToken, setCopiedToken] = useState<string | null>(null)
    const [invites, setInvites] = useState<Invite[]>([])
    const [busy, setBusy] = useState(false)
    // Ham hata saklanır, mesaj ekrana çizilirken çevrilir
    const [error, setError] = useState<unknown>(null)

    useEffect(() => {
        let cancelled = false
        getOpenInvites()
            .then((result) => {
                if (!cancelled) {
                    setInvites(result)
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
    }, [])

    // Açıkken arkadaki sayfa kaymasın; Esc kapatır
    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }
        document.addEventListener('keydown', handleKey)
        return () => {
            document.body.style.overflow = previousOverflow
            document.removeEventListener('keydown', handleKey)
        }
    }, [onClose])

    const handleCreate = async () => {
        setBusy(true)
        setError(null)
        try {
            const invite = await createInvite({ months, note: note.trim() === '' ? null : note.trim() })
            setCreated(invite)
            setCopiedToken(null)
            setNote('')
            setInvites((current) => [invite, ...current])
        } catch (caught) {
            setError(caught)
        } finally {
            setBusy(false)
        }
    }

    const handleCopy = async (token: string) => {
        try {
            await navigator.clipboard.writeText(inviteLink(token))
            setCopiedToken(token)
        } catch {
            // Pano izni yoksa kullanıcı linki elle seçip kopyalayabilir
            setCopiedToken(null)
        }
    }

    const handleDelete = async (id: number) => {
        setError(null)
        try {
            await deleteInvite(id)
            setInvites((current) => current.filter((invite) => invite.id !== id))
            if (created?.id === id) {
                setCreated(null)
            }
        } catch (caught) {
            setError(caught)
        }
    }

    const formatDate = (value: string) => new Date(value).toLocaleDateString(i18n.language)
    const createdLink = created ? inviteLink(created.token) : ''

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={t('invites.title')}>
            <button type="button" aria-label={t('invites.close')} onClick={onClose} className="absolute inset-0 bg-ink/40" />
            <div className="relative max-h-[90vh] w-full max-w-lg animate-rise overflow-y-auto rounded-t-[2rem] bg-cream p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-float sm:rounded-[2rem] sm:pb-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
                        <Link2 className="h-5 w-5 text-brand" />
                        {t('invites.title')}
                    </h2>
                    <button type="button" onClick={onClose} aria-label={t('invites.close')} className="rounded-full p-2 text-muted hover:bg-card">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <section className="space-y-4 rounded-3xl bg-card p-4 shadow-soft">
                    <div>
                        <p className={labelClass}>{t('invites.package')}</p>
                        <div className="flex gap-2">
                            {PACKAGE_MONTHS.map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setMonths(value)}
                                    className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                                        months === value ? 'border-brand bg-brand text-cream' : 'border-line bg-cream text-muted hover:border-brand hover:text-brand'
                                    }`}
                                >
                                    {t('invites.months', { count: value })}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="invite-note" className={labelClass}>{t('invites.note')}</label>
                        <input
                            id="invite-note"
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder={t('invites.notePlaceholder')}
                            maxLength={60}
                            className={inputClass}
                        />
                    </div>
                    <button type="button" onClick={handleCreate} disabled={busy} className={primaryButtonClass}>
                        {t('invites.create')}
                    </button>

                    {/* Oluşturulan link: kopyala veya WhatsApp'ta paylaş */}
                    {created && (
                        <div className="animate-pop space-y-2 rounded-2xl bg-sage p-3">
                            <p className="text-sm font-semibold text-brand">{t('invites.ready', { count: created.months })}</p>
                            <p className="break-all rounded-xl bg-card px-3 py-2 text-xs text-ink">{createdLink}</p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => void handleCopy(created.token)}
                                    className="flex flex-1 items-center justify-center gap-1 rounded-full border border-brand bg-card px-3 py-2 text-sm font-semibold text-brand"
                                >
                                    {copiedToken === created.token ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copiedToken === created.token ? t('invites.copied') : t('invites.copy')}
                                </button>
                                <a
                                    href={whatsappShareLink(t('invites.shareText', { link: createdLink, count: created.months }))}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-1 items-center justify-center gap-1 rounded-full bg-whatsapp px-3 py-2 text-sm font-bold text-whatsapp-ink"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    {t('invites.share')}
                                </a>
                            </div>
                        </div>
                    )}
                    {error !== null && <p className="text-sm text-danger">{toErrorMessage(error, t, 'invites.error')}</p>}
                </section>

                {/* Açık davetler: kullanılmamış ve süresi dolmamış */}
                <h3 className="mb-2 mt-5 px-1 text-sm font-bold text-muted">{t('invites.openTitle')}</h3>
                {invites.length === 0 ? (
                    <p className="px-1 text-sm text-muted">{t('invites.none')}</p>
                ) : (
                    <ul className="space-y-2">
                        {invites.map((invite) => (
                            <li key={invite.id} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-soft">
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-semibold text-ink">{invite.note ?? t('invites.unnamed')}</span>
                                    <span className="block text-xs text-muted">
                                        {t('invites.months', { count: invite.months })} · {t('invites.validUntil', { date: formatDate(invite.expiresAt) })}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => void handleCopy(invite.token)}
                                    aria-label={copiedToken === invite.token ? t('invites.copied') : t('invites.copy')}
                                    className="rounded-full p-2 text-muted hover:bg-cream hover:text-brand"
                                >
                                    {copiedToken === invite.token ? <Check className="h-4 w-4 text-brand" /> : <Copy className="h-4 w-4" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleDelete(invite.id)}
                                    aria-label={t('invites.delete')}
                                    className="rounded-full p-2 text-danger hover:bg-danger-soft"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default InvitePanel
