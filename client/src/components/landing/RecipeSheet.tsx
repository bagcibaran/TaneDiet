import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

import { TONE_CLASSES, type Recipe } from '../../landing/content'

type RecipeSheetProps = {
    recipe: Recipe
    onClose: () => void
}

// Alttan açılan tarif: malzemeler ve yapılışı. Arka plana dokunmak ya da Esc kapatır.
// body'ye portal ile çizilir: bölümlerin kayma animasyonu (transform) fixed konumu bozmasın.
function RecipeSheet({ recipe, onClose }: RecipeSheetProps) {
    const { t } = useTranslation()

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

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={recipe.name}>
            <button type="button" aria-label={t('landing.close')} onClick={onClose} className="absolute inset-0 bg-ink/40" />
            <div className="relative max-h-[85vh] w-full max-w-lg animate-rise overflow-y-auto rounded-t-[2rem] bg-card shadow-float sm:rounded-[2rem]">
                <div className={`flex h-32 items-center justify-center text-7xl ${TONE_CLASSES[recipe.tone]}`}>{recipe.emoji}</div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('landing.close')}
                    className="absolute right-3 top-3 rounded-full bg-card/80 p-2 text-ink backdrop-blur"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="p-5">
                    <h3 className="text-2xl font-extrabold tracking-tight text-ink">{recipe.name}</h3>
                    <p className="text-sm text-muted">
                        {t('landing.minutes', { count: recipe.minutes })} · {recipe.meal}
                    </p>

                    <h4 className="mt-4 font-bold text-ink">{t('landing.ingredients')}</h4>
                    <ul className="mt-1 space-y-1 text-ink">
                        {recipe.ingredients.map((item) => (
                            <li key={item} className="flex gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <h4 className="mt-4 font-bold text-ink">{t('landing.steps')}</h4>
                    <ol className="mt-1 space-y-2 text-ink">
                        {recipe.steps.map((step, index) => (
                            <li key={step} className="flex gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-xs font-bold text-brand">
                                    {index + 1}
                                </span>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>,
        document.body,
    )
}

export default RecipeSheet
