import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

import DietLibraryManager from './DietLibraryManager'
import type { DietLibrary } from '../../types/dietLibrary'

type LibrarySheetProps = {
    open: boolean
    library: DietLibrary
    onChange: (update: (current: DietLibrary) => DietLibrary) => void
    onClose: () => void
}

// Program editörünün üstünde tam ekran açılan "Hazırlar" penceresi.
// Editör sayfası kapanmaz, yarım kalan program kaybolmaz.
function LibrarySheet({ open, library, onChange, onClose }: LibrarySheetProps) {
    const { t } = useTranslation()

    // Açıkken arkadaki sayfa kaymasın; Esc kapatır (yazı alanındaki Esc yalnızca o düzenlemeyi iptal eder)
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

    return (
        <div role="dialog" aria-modal="true" aria-label={t('nav.library')} className="fixed inset-0 z-50 flex flex-col bg-cream">
            <header className="flex items-center justify-between bg-brand px-5 py-4 text-cream">
                <h2 className="text-lg font-bold">{t('nav.library')}</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1 rounded-full bg-cream px-3 py-1.5 text-sm font-semibold text-brand"
                >
                    <X className="h-4 w-4" />
                    {t('diet.library.close')}
                </button>
            </header>
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-5xl px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5">
                    <DietLibraryManager library={library} onChange={onChange} />
                </div>
            </div>
        </div>
    )
}

export default LibrarySheet
