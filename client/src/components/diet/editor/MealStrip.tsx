import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

import BottomSheet from './BottomSheet'
import { AddMealOptions } from './MealList'
import { itemCount, type AddableMeal, type EditorMeal } from './types'
import type { DietLibrary } from '../../../types/dietLibrary'

type MealStripProps = {
    meals: EditorMeal[]
    selectedKey: string | null
    library: DietLibrary | null
    onSelect: (key: string) => void
    onAdd: (meal: AddableMeal) => void
}

// Telefon ve dik tablette öğün şeridi: yatay kayan öğün düğmeleri ve "+ Öğün" (alttan açılan panel)
function MealStrip({ meals, selectedKey, library, onSelect, onAdd }: MealStripProps) {
    const { t } = useTranslation()
    const [addOpen, setAddOpen] = useState(false)
    const closeAdd = useCallback(() => setAddOpen(false), [])

    return (
        <>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {meals.map((meal) => {
                    const selected = meal.key === selectedKey
                    return (
                        <button
                            key={meal.key}
                            type="button"
                            onClick={() => onSelect(meal.key)}
                            aria-pressed={selected}
                            className={`max-w-[11rem] shrink-0 truncate rounded-full border px-3 py-2 text-sm font-semibold transition ${
                                selected ? 'border-brand bg-brand text-cream' : 'border-line bg-card text-ink hover:border-brand'
                            }`}
                        >
                            {meal.name.trim() || t('diet.editor.unnamedMeal')}
                            <span className={selected ? 'text-mint' : 'text-muted'}> · {itemCount(meal)}</span>
                        </button>
                    )
                })}
                <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-brand px-3 py-2 text-sm font-semibold text-brand hover:bg-card"
                >
                    <Plus className="h-4 w-4" />
                    {t('diet.editor.addMealShort')}
                </button>
            </div>

            <BottomSheet open={addOpen} title={t('diet.editor.addMealTitle')} onClose={closeAdd}>
                <AddMealOptions
                    library={library}
                    onAdd={(meal) => {
                        onAdd(meal)
                        setAddOpen(false)
                    }}
                />
            </BottomSheet>
        </>
    )
}

export default MealStrip
