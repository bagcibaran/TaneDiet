import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

type BottomSheetProps = {
    open: boolean
    title: string
    onClose: () => void
    children: ReactNode
}

// Telefonda alttan açılan panel (ekranın yarısı kadar): arkadaki açık öğün görünür kalır.
// Portal ile body'ye çizilir: animasyonlu kartların içinde fixed konum bozulmasın.
function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
    const { t } = useTranslation()

    // Açıkken arkadaki sayfa kaymasın; Esc kapatır (yazı alanındaki Esc hariç)
    useEffect(() => {
        if (!open) {
            return
        }
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const handleKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null
            const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA'
            if (event.key === 'Escape' && !typing) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleKey)
        return () => {
            document.body.style.overflow = previousOverflow
            document.removeEventListener('keydown', handleKey)
        }
    }, [open, onClose])

    if (!open) {
        return null
    }

    return createPortal(
        <div className="fixed inset-0 z-[65] flex items-end" role="dialog" aria-modal="true" aria-label={title}>
            <button type="button" aria-label={t('diet.editor.done')} onClick={onClose} className="absolute inset-0 bg-ink/30" />
            <div className="relative flex max-h-[55vh] w-full animate-rise flex-col rounded-t-[2rem] bg-card shadow-float">
                <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
                    <h2 className="min-w-0 truncate font-bold text-ink">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-cream hover:bg-brand-dark"
                    >
                        {t('diet.editor.done')}
                    </button>
                </div>
                <div className="overflow-y-auto px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">{children}</div>
            </div>
        </div>,
        document.body,
    )
}

export default BottomSheet
