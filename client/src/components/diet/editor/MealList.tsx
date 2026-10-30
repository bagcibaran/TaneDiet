import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { itemCount, type AddableMeal, type EditorMeal } from './types'
import type { DietLibrary } from '../../../types/dietLibrary'

type AddMealOptionsProps = {
    library: DietLibrary | null
    onAdd: (meal: AddableMeal) => void
}

// Hazır öğünler ve "+ Boş öğün". Hazırlar yüklenemese de boş öğün eklenebilir.
export function AddMealOptions({ library, onAdd }: AddMealOptionsProps) {
    const { t } = useTranslation()

    return (
        <div className="flex flex-col gap-1.5">
            {library?.meals.map((meal) => (
                <button
                    key={meal.id}
                    type="button"
                    onClick={() => onAdd(meal)}
                    className="flex items-center justify-between gap-2 rounded-xl border border-line bg-cream px-3 py-2 text-left text-sm text-ink transition hover:border-brand"
                >
                    <span className="min-w-0 truncate">
                        <span className="font-semibold">{meal.name}</span>
                        {meal.time && <span className="text-muted"> · {meal.time}</span>}
                    </span>
                    <span className="font-extrabold text-brand">+</span>
                </button>
            ))}
            <button
                type="button"
                onClick={() => onAdd({ name: '', time: null, items: '' })}
                className="rounded-xl border border-dashed border-line px-3 py-2 text-left text-sm text-muted transition hover:border-brand hover:text-brand"
            >
                + {t('diet.editor.emptyMeal')}
            </button>
        </div>
    )
}

type MealListProps = {
    meals: EditorMeal[]
    selectedKey: string | null
    library: DietLibrary | null
    onSelect: (key: string) => void
    onMove: (key: string, direction: -1 | 1) => void
    onAdd: (meal: AddableMeal) => void
}

// Büyük ekranda sol sütun: günün öğünleri (tıklayınca ortada açılır) ve altında "Öğün ekle"
function MealList({ meals, selectedKey, library, onSelect, onMove, onAdd }: MealListProps) {
    const { t } = useTranslation()

    return (
        <div className="space-y-4">
            <div>
                <h2 className="mb-2 text-sm font-bold text-ink">{t('diet.editor.mealsOfDay')}</h2>
                {meals.length === 0 && <p className="text-sm text-muted">{t('diet.editor.dayEmpty')}</p>}
                <div className="flex flex-col gap-1.5">
                    {meals.map((meal, index) => {
                        const selected = meal.key === selectedKey
                        return (
                            <div
                                key={meal.key}
                                className={`flex items-center rounded-xl transition ${
                                    selected ? 'bg-brand text-cream shadow-soft' : 'bg-cream text-ink hover:bg-mint/30'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => onSelect(meal.key)}
                                    aria-pressed={selected}
                                    className="min-w-0 flex-1 px-3 py-2 text-left text-sm"
                                >
                                    <span className="block truncate font-semibold">
                                        {meal.name.trim() || t('diet.editor.unnamedMeal')}
                                    </span>
                                    <span className={`text-xs ${selected ? 'text-mint' : 'text-muted'}`}>
                                        {meal.time || '—'} · {itemCount(meal)}
                                    </span>
                                </button>
                                {selected && (
                                    <div className="flex shrink-0 flex-col pr-1">
                                        <button
                                            type="button"
                                            onClick={() => onMove(meal.key, -1)}
                                            disabled={index === 0}
                                            aria-label={t('diet.editor.moveUp')}
                                            className="rounded-full p-1 hover:bg-cream/20 disabled:opacity-30"
                                        >
                                            <ArrowUp className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onMove(meal.key, 1)}
                                            disabled={index === meals.length - 1}
                                            aria-label={t('diet.editor.moveDown')}
                                            className="rounded-full p-1 hover:bg-cream/20 disabled:opacity-30"
                                        >
                                            <ArrowDown className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div>
                <h2 className="mb-2 text-sm font-bold text-ink">{t('diet.editor.addMealTitle')}</h2>
                <AddMealOptions library={library} onAdd={onAdd} />
            </div>
        </div>
    )
}

export default MealList
