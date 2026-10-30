import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Settings2 } from 'lucide-react'

import { SkeletonCard } from '../../Skeleton'
import { toErrorMessage } from '../../../services/errorMessage'
import type { DietLibrary } from '../../../types/dietLibrary'

type ItemPickerProps = {
    // null: henüz yükleniyor ya da yüklenemedi
    library: DietLibrary | null
    loadError: unknown
    // Maddelerin ekleneceği açık öğünün adı; null = açık öğün yok (düğmeler pasif)
    targetName: string | null
    optionMode: boolean
    onOptionModeChange: (value: boolean) => void
    onAddItem: (text: string) => void
    // Hazırları düzenleme penceresini açar
    onEdit: () => void
    // Alttan açılan panelde başlık zaten panelin kendisinde: burada gizlenir
    hideTitle?: boolean
}

// Editörün madde sütunu: arama, kategoriler alt alta, dokununca açık öğüne eklenir
function ItemPicker({ library, loadError, targetName, optionMode, onOptionModeChange, onAddItem, onEdit, hideTitle = false }: ItemPickerProps) {
    const { t } = useTranslation()
    const [query, setQuery] = useState('')

    const needle = query.trim().toLocaleLowerCase('tr')
    const categories = (library?.categories ?? [])
        .map((category) => ({
            ...category,
            items: needle === '' ? category.items : category.items.filter((item) => item.text.toLocaleLowerCase('tr').includes(needle)),
        }))
        .filter((category) => needle === '' || category.items.length > 0)
    const disabled = targetName === null

    return (
        <div className="space-y-3">
            <div className={`flex items-center gap-2 ${hideTitle ? 'justify-end' : 'justify-between'}`}>
                <h2 className={`min-w-0 truncate text-sm font-bold text-ink ${hideTitle ? 'hidden' : ''}`}>
                    {targetName === null
                        ? t('diet.editor.tabItems')
                        : t('diet.editor.itemsFor', { name: targetName || t('diet.editor.unnamedMeal') })}
                </h2>
                <button
                    type="button"
                    onClick={onEdit}
                    disabled={library === null}
                    className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand disabled:opacity-40"
                >
                    <Settings2 className="h-4 w-4" />
                    {t('diet.editor.editLibrary')}
                </button>
            </div>

            {disabled && <p className="rounded-2xl bg-peach px-3 py-2 text-xs text-peach-ink">{t('diet.editor.addMealFirst')}</p>}

            <label className="flex items-center gap-2 rounded-2xl border border-line bg-cream px-3 py-2 focus-within:border-brand">
                <Search className="h-4 w-4 shrink-0 text-muted" />
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('diet.editor.search')}
                    aria-label={t('diet.editor.search')}
                    className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
                />
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-muted">
                <input
                    type="checkbox"
                    checked={optionMode}
                    onChange={(event) => onOptionModeChange(event.target.checked)}
                    className="h-4 w-4 accent-brand"
                />
                {t('diet.editor.addAsOption')}
            </label>

            {library === null && loadError === null && <SkeletonCard bare lines={4} label={t('common.loading')} />}
            {loadError !== null && <p className="text-sm text-danger">{toErrorMessage(loadError, t, 'diet.library.loadError')}</p>}

            {library && library.categories.length === 0 && <p className="text-sm text-muted">{t('diet.library.emptyItems')}</p>}
            {library && needle !== '' && categories.length === 0 && (
                <p className="text-sm text-muted">{t('diet.editor.noSearchResult')}</p>
            )}

            {categories.map((category) => (
                <section key={category.id}>
                    <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-brand">{category.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {category.items.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                disabled={disabled}
                                onClick={() => onAddItem(item.text)}
                                className="rounded-lg bg-mint/30 px-2.5 py-1.5 text-left text-sm text-ink transition hover:bg-mint/60 active:scale-[0.97] disabled:opacity-40"
                            >
                                + {item.text}
                            </button>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}

export default ItemPicker
