import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

import { FeedbackContext, type ConfirmOptions, type ToastTone } from './feedbackContext'

type Toast = { id: number; message: string; tone: ToastTone }

type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void }

// Uygulamanın tamamına bildirim (toast) ve markalı onay penceresi sağlar.
// İkisi de body'ye portal ile çizilir: animasyonlu kartların içinde fixed konum bozulmasın.
function FeedbackProvider({ children }: { children: ReactNode }) {
    const { t } = useTranslation()
    const [toasts, setToasts] = useState<Toast[]>([])
    const [pending, setPending] = useState<PendingConfirm | null>(null)
    // requireText için kullanıcının yazdığı
    const [typed, setTyped] = useState('')
    const nextId = useRef(0)
    const confirmButton = useRef<HTMLButtonElement>(null)
    const typedInput = useRef<HTMLInputElement>(null)

    const toast = useCallback((message: string, tone: ToastTone = 'success') => {
        const id = ++nextId.current
        setToasts((current) => [...current.slice(-2), { id, message, tone }])
        window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 2800)
    }, [])

    const confirm = useCallback(
        (options: ConfirmOptions) =>
            new Promise<boolean>((resolve) => {
                setTyped('')
                setPending({ ...options, resolve })
            }),
        [],
    )

    const close = useCallback(
        (result: boolean) => {
            pending?.resolve(result)
            setPending(null)
        },
        [pending],
    )

    // Onay açıkken: Esc vazgeçer, sayfa kaymaz, odak onay düğmesine (yazarak onayda kutuya) gider
    useEffect(() => {
        if (!pending) {
            return
        }
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        if (pending.requireText) {
            typedInput.current?.focus()
        } else {
            confirmButton.current?.focus()
        }
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close(false)
            }
        }
        document.addEventListener('keydown', handleKey)
        return () => {
            document.body.style.overflow = previousOverflow
            document.removeEventListener('keydown', handleKey)
        }
    }, [pending, close])

    const api = useMemo(() => ({ toast, confirm }), [toast, confirm])

    const confirmBlocked = pending?.requireText !== undefined && typed !== pending.requireText

    return (
        <FeedbackContext.Provider value={api}>
            {children}

            {createPortal(
                <>
                    {/* Bildirimler: telefonda alt menünün üstünde, ortada */}
                    <div
                        aria-live="polite"
                        className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
                    >
                        {toasts.map((item) => (
                            <div
                                key={item.id}
                                role="status"
                                className="pointer-events-auto flex animate-pop items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream shadow-float"
                            >
                                {item.tone === 'success' ? (
                                    <CheckCircle2 className="h-4 w-4 text-mint" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-coral" />
                                )}
                                {item.message}
                            </div>
                        ))}
                    </div>

                    {/* Onay penceresi: telefonda alttan açılır, bilgisayarda ortada */}
                    {pending && (
                        <div
                            className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="confirm-title"
                            aria-describedby={pending.message ? 'confirm-message' : undefined}
                        >
                            <button
                                type="button"
                                aria-label={t('common.cancel')}
                                onClick={() => close(false)}
                                className="absolute inset-0 bg-ink/40"
                            />
                            <div className="relative w-full max-w-md animate-rise rounded-t-[2rem] bg-card p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-float sm:rounded-[2rem] sm:pb-6">
                                <span
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                        pending.danger ? 'bg-coral/20 text-danger' : 'bg-sage text-brand'
                                    }`}
                                >
                                    <AlertTriangle className="h-6 w-6" />
                                </span>
                                <h2 id="confirm-title" className="mt-4 text-xl font-extrabold tracking-tight text-ink">
                                    {pending.title}
                                </h2>
                                {pending.message && (
                                    <p id="confirm-message" className="mt-2 text-muted">
                                        {pending.message}
                                    </p>
                                )}
                                {pending.requireText !== undefined && (
                                    <label className="mt-4 block text-sm font-medium text-ink">
                                        {t('common.typeToConfirm', { text: pending.requireText })}
                                        <input
                                            ref={typedInput}
                                            value={typed}
                                            onChange={(event) => setTyped(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' && !confirmBlocked) {
                                                    close(true)
                                                }
                                            }}
                                            autoCapitalize="off"
                                            autoCorrect="off"
                                            autoComplete="off"
                                            spellCheck={false}
                                            className="mt-1 w-full rounded-2xl border border-line bg-cream px-3 py-3 text-ink outline-none transition focus:border-danger focus:ring-2 focus:ring-danger/20"
                                        />
                                    </label>
                                )}
                                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => close(false)}
                                        className="rounded-full border border-line px-5 py-3 font-semibold text-muted transition hover:border-brand hover:text-brand"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        ref={confirmButton}
                                        type="button"
                                        disabled={confirmBlocked}
                                        onClick={() => close(true)}
                                        className={`rounded-full px-5 py-3 font-semibold text-cream shadow-soft transition active:scale-[0.98] disabled:opacity-50 ${
                                            pending.danger ? 'bg-danger hover:brightness-95' : 'bg-brand hover:bg-brand-dark'
                                        }`}
                                    >
                                        {pending.confirmLabel}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>,
                document.body,
            )}
        </FeedbackContext.Provider>
    )
}

export default FeedbackProvider
