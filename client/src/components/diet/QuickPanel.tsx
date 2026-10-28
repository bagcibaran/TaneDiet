import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings2, Zap } from 'lucide-react'

import { toErrorMessage } from '../../services/errorMessage'
import type { DietLibrary } from '../../types/dietLibrary'

type QuickPanelProps = {
    // null: henüz yükleniyor ya da yüklenemedi
    library: DietLibrary | null
    loadError: unknown
    optionMode: boolean
    onOptionModeChange: (value: boolean) => void
    // Hazır öğün (ya da boş öğün) o güne eklenir
    onAddMeal: (meal: { name: string; time: string | null; items: string }) => void
    // Madde seçili öğüne eklenir
    onAddItem: (text: string) => void
    // Hazırları düzenleme penceresini açar
    onEdit: () => void
}

const chipClass = (active: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
        active ? 'border-brand bg-brand text-cream' : 'border-line bg-cream text-muted hover:border-brand hover:text-brand'
    }`

// Program editörünün üstündeki yapışkan panel: "Öğünler" (hazır öğünler) ve "Maddeler" (hızlı maddeler)
function QuickPanel({ library, loadError, optionMode, onOptionModeChange, onAddMeal, onAddItem, onEdit }: QuickPanelProps) {
    const { t } = useTranslation()
    const [tab, setTab] = useState<'meals' | 'items'>('meals')
    const [categoryId, setCategoryId] = useState<number | null>(null)

    // Seçili kategori silindiyse ilk kategori gösterilir
    const category = library?.categories.find((item) => item.id === categoryId) ?? library?.categories[0]

    return (
        <section className="sticky top-0 z-30 space-y-3 rounded-3xl bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-brand" />
                    {(['meals', 'items'] as const).map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            className={`rounded-full px-3 py-1 text-sm font-bold transition ${
                                tab === key ? 'bg-mint/40 text-brand' : 'text-muted hover:text-brand'
                            }`}
                        >
                            {t(key === 'meals' ? 'diet.editor.tabMeals' : 'diet.editor.tabItems')}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={onEdit}
                    disabled={library === null}
                    className="flex items-center gap-1 text-sm font-semibold text-brand disabled:opacity-40"
                >
                    <Settings2 className="h-4 w-4" />
                    {t('diet.editor.editLibrary')}
                </button>
            </div>

            {library === null && loadError === null && <p className="text-sm text-muted">{t('dashboard.loading')}</p>}
            {loadError !== null && (
                <p className="text-sm text-red-700">{toErrorMessage(loadError, t, 'diet.library.loadError')}</p>
            )}

            {/* Öğünler: hazır öğünler ve boş öğün */}
            {library && tab === 'meals' && (
                <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                    {library.meals.map((meal) => (
                        <button
                            key={meal.id}
                            type="button"
                            onClick={() => onAddMeal(meal)}
                            className="rounded-lg bg-mint/30 px-2.5 py-1.5 text-left text-sm text-ink hover:bg-mint/60"
                        >
                            + <span className="font-semibold">{meal.name}</span>
                            {meal.time && <span className="text-muted"> · {meal.time}</span>}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => onAddMeal({ name: '', time: null, items: '' })}
                        className="rounded-lg border border-dashed border-line px-2.5 py-1.5 text-sm text-muted hover:border-brand hover:text-brand"
                    >
                        + {t('diet.editor.emptyMeal')}
                    </button>
                </div>
            )}

            {/* Maddeler: kategori seç, maddeye dokun */}
            {library && tab === 'items' && (
                <>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {library.categories.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setCategoryId(item.id)}
                                className={chipClass(category?.id === item.id)}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-muted">
                        <input
                            type="checkbox"
                            checked={optionMode}
                            onChange={(e) => onOptionModeChange(e.target.checked)}
                            className="h-4 w-4 accent-brand"
                        />
                        {t('diet.editor.addAsOption')}
                    </label>
                    <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                        {category?.items.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onAddItem(item.text)}
                                className="rounded-lg bg-mint/30 px-2.5 py-1.5 text-left text-sm text-ink hover:bg-mint/60"
                            >
                                + {item.text}
                            </button>
                        ))}
                        {library.categories.length === 0 && (
                            <p className="text-sm text-muted">{t('diet.library.emptyItems')}</p>
                        )}
                    </div>
                </>
            )}
        </section>
    )
}

export default QuickPanel
