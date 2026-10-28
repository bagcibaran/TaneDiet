import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import RecipeSheet from './RecipeSheet'
import { RECIPES, TONE_CLASSES, type Recipe } from '../../landing/content'

// Yana kayan tarif kartları; dokununca tarif alttan açılır
function RecipeRow() {
    const { t } = useTranslation()
    const [open, setOpen] = useState<Recipe | null>(null)
    const close = useCallback(() => setOpen(null), [])

    return (
        <>
            <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
                {RECIPES.map((recipe) => (
                    <button
                        key={recipe.id}
                        type="button"
                        onClick={() => setOpen(recipe)}
                        className="w-40 shrink-0 snap-start overflow-hidden rounded-3xl bg-card text-left shadow-soft transition hover:-translate-y-1 hover:-rotate-1"
                    >
                        <span className={`flex h-24 items-center justify-center text-5xl ${TONE_CLASSES[recipe.tone]}`}>{recipe.emoji}</span>
                        <span className="block p-3">
                            <span className="block font-bold text-ink">{recipe.name}</span>
                            <span className="block text-xs text-muted">
                                {t('landing.minutes', { count: recipe.minutes })} · {recipe.meal}
                            </span>
                        </span>
                    </button>
                ))}
            </div>
            {open && <RecipeSheet recipe={open} onClose={close} />}
        </>
    )
}

export default RecipeRow
