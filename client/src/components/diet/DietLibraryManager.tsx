import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'

import { errorTextClass, inputClass } from '../ui'
import { itemLines } from '../../diet/dietUtils'
import {
    addQuickItem,
    createMealTemplate,
    createQuickCategory,
    deleteMealTemplate,
    deleteQuickCategory,
    deleteQuickItem,
    renameQuickCategory,
    updateMealTemplate,
    updateQuickItem,
} from '../../services/dietLibraryService'
import { toErrorMessage } from '../../services/errorMessage'
import type { DietLibrary, MealTemplate, MealTemplateRequest, QuickPickItem } from '../../types/dietLibrary'

type DietLibraryManagerProps = {
    library: DietLibrary
    // Her değişiklik hemen kaydedilir; başarılı olunca listeyi güncelleyen fonksiyon buraya gelir.
    // Fonksiyon en güncel listeye uygulanır (arka arkaya iki kayıt birbirini ezmesin).
    onChange: (update: (current: DietLibrary) => DietLibrary) => void
}

type MealDraft = { name: string; time: string; items: string }

// Hazır öğünler saate göre, saatsizler sonda (backend ile aynı sıra)
const sortMeals = (meals: MealTemplate[]) =>
    [...meals].sort((a, b) => {
        if (a.time === b.time) {
            return a.id - b.id
        }
        if (a.time === null) {
            return 1
        }
        if (b.time === null) {
            return -1
        }
        return a.time.localeCompare(b.time)
    })

const toRequest = (draft: MealDraft): MealTemplateRequest => ({
    name: draft.name.trim(),
    time: draft.time.trim() === '' ? null : draft.time,
    items: draft.items,
})

const chipButtonClass = 'rounded-full p-1 text-muted hover:bg-cream hover:text-brand'

// Hazırlar: diyetisyenin hazır öğünlerini ve hızlı maddelerini ekleme, düzenleme, silme.
// "Hazırlar" sekmesinde ve program editörünün üstünde açılan pencerede aynı bileşen kullanılır.
function DietLibraryManager({ library, onChange }: DietLibraryManagerProps) {
    const { t } = useTranslation()

    // Düzenlenen hazır öğün: id, 'new' (yeni) ya da null
    const [editingMeal, setEditingMeal] = useState<number | 'new' | null>(null)
    const [mealDraft, setMealDraft] = useState<MealDraft>({ name: '', time: '', items: '' })
    // Yeniden adlandırılan kategori ve düzenlenen / eklenen madde
    const [editingCategory, setEditingCategory] = useState<number | 'new' | null>(null)
    const [categoryDraft, setCategoryDraft] = useState('')
    const [editingItem, setEditingItem] = useState<number | null>(null)
    const [addingItemTo, setAddingItemTo] = useState<number | null>(null)
    const [itemDraft, setItemDraft] = useState('')
    const [busy, setBusy] = useState(false)
    // Aynı anda tek istek: hızlı iki Enter aynı maddeyi iki kez kaydetmesin (state bir sonraki çizime kadar eski kalır, ref hemen değişir)
    const busyRef = useRef(false)
    // Hata ve nerede olduğu: ham hata ya da i18n anahtarı; mesaj ekrana çizilirken çevrilir
    const [error, setError] = useState<{ at: string; error?: unknown; messageKey?: string } | null>(null)

    // Bir API isteğini çalıştırır; hata olursa ilgili satırın altında gösterilir
    const run = async (at: string, action: () => Promise<void>) => {
        if (busyRef.current) {
            return
        }
        busyRef.current = true
        setBusy(true)
        setError(null)
        try {
            await action()
        } catch (caught) {
            setError({ at, error: caught })
        } finally {
            busyRef.current = false
            setBusy(false)
        }
    }

    const errorAt = (at: string) =>
        error?.at === at && (
            <p className={`mt-2 ${errorTextClass}`}>
                {error.messageKey ? t(error.messageKey) : toErrorMessage(error.error, t, 'diet.library.saveError')}
            </p>
        )

    // Enter kaydeder, Esc vazgeçer (tek satırlık girişlerde)
    const handleInlineKey = (event: KeyboardEvent<HTMLInputElement>, save: () => void, cancel: () => void) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            save()
        }
        if (event.key === 'Escape') {
            cancel()
        }
    }

    // ---------- Hazır öğünler ----------

    const startMealEdit = (meal: MealTemplate | null) => {
        setEditingMeal(meal ? meal.id : 'new')
        setMealDraft({ name: meal?.name ?? '', time: meal?.time ?? '', items: meal?.items ?? '' })
        setError(null)
    }

    const saveMeal = (event: FormEvent) => {
        event.preventDefault()
        const at = `meal-${editingMeal}`
        if (mealDraft.name.trim() === '') {
            setError({ at, messageKey: 'diet.library.nameRequired' })
            return
        }
        void run(at, async () => {
            const request = toRequest(mealDraft)
            if (editingMeal === 'new') {
                const created = await createMealTemplate(request)
                onChange((current) => ({ ...current, meals: sortMeals([...current.meals, created]) }))
            } else if (editingMeal !== null) {
                const updated = await updateMealTemplate(editingMeal, request)
                onChange((current) => ({
                    ...current,
                    meals: sortMeals(current.meals.map((meal) => (meal.id === updated.id ? updated : meal))),
                }))
            }
            setEditingMeal(null)
        })
    }

    const removeMeal = (id: number) =>
        run(`meal-${id}`, async () => {
            await deleteMealTemplate(id)
            onChange((current) => ({ ...current, meals: current.meals.filter((meal) => meal.id !== id) }))
        })

    const mealForm = (
        <form onSubmit={saveMeal} className="space-y-2 rounded-3xl bg-card p-4 shadow-soft ring-2 ring-brand">
            <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                    <input
                        aria-label={t('diet.editor.mealName')}
                        value={mealDraft.name}
                        onChange={(e) => setMealDraft({ ...mealDraft, name: e.target.value })}
                        placeholder={t('diet.editor.mealName')}
                        maxLength={60}
                        autoFocus
                        className={`${inputClass} font-semibold`}
                    />
                </div>
                <div className="w-28 shrink-0">
                    <input
                        aria-label={t('diet.editor.mealTime')}
                        type="time"
                        value={mealDraft.time}
                        onChange={(e) => setMealDraft({ ...mealDraft, time: e.target.value })}
                        className={inputClass}
                    />
                </div>
            </div>
            <textarea
                aria-label={t('diet.editor.items')}
                rows={Math.max(3, mealDraft.items.split('\n').length + 1)}
                value={mealDraft.items}
                onChange={(e) => setMealDraft({ ...mealDraft, items: e.target.value })}
                placeholder={t('diet.library.itemsPlaceholder')}
                className={inputClass}
            />
            {errorAt(`meal-${editingMeal}`)}
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => setEditingMeal(null)}
                    className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted hover:border-brand hover:text-brand"
                >
                    {t('diet.library.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={busy}
                    className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream hover:bg-brand-dark disabled:opacity-50"
                >
                    {t('diet.library.save')}
                </button>
            </div>
        </form>
    )

    // ---------- Kategoriler ve maddeler ----------

    const saveCategory = () => {
        const name = categoryDraft.trim()
        const at = `category-${editingCategory}`
        if (name === '') {
            setError({ at, messageKey: 'diet.library.nameRequired' })
            return
        }
        void run(at, async () => {
            if (editingCategory === 'new') {
                const created = await createQuickCategory(name)
                onChange((current) => ({ ...current, categories: [...current.categories, created] }))
            } else if (editingCategory !== null) {
                const renamed = await renameQuickCategory(editingCategory, name)
                onChange((current) => ({
                    ...current,
                    categories: current.categories.map((category) => (category.id === renamed.id ? renamed : category)),
                }))
            }
            setEditingCategory(null)
        })
    }

    const removeCategory = (id: number, name: string) => {
        if (!window.confirm(t('diet.library.confirmDeleteCategory', { name }))) {
            return
        }
        void run(`category-${id}`, async () => {
            await deleteQuickCategory(id)
            onChange((current) => ({ ...current, categories: current.categories.filter((category) => category.id !== id) }))
        })
    }

    // Kategorinin maddelerini değiştirip yeni listeyi bildirir
    const changeItems = (categoryId: number, change: (items: QuickPickItem[]) => QuickPickItem[]) =>
        onChange((current) => ({
            ...current,
            categories: current.categories.map((category) =>
                category.id === categoryId ? { ...category, items: change(category.items) } : category,
            ),
        }))

    const saveNewItem = (categoryId: number) => {
        const text = itemDraft.trim()
        if (text === '') {
            setAddingItemTo(null)
            return
        }
        void run(`category-${categoryId}`, async () => {
            const created = await addQuickItem(categoryId, text)
            changeItems(categoryId, (items) => [...items, created])
            // Giriş açık kalır: arka arkaya madde eklenebilir
            setItemDraft('')
        })
    }

    const saveItem = (categoryId: number, itemId: number) => {
        const text = itemDraft.trim()
        if (text === '') {
            setEditingItem(null)
            return
        }
        void run(`category-${categoryId}`, async () => {
            const updated = await updateQuickItem(itemId, text)
            changeItems(categoryId, (items) => items.map((item) => (item.id === updated.id ? updated : item)))
            setEditingItem(null)
        })
    }

    const removeItem = (categoryId: number, itemId: number) =>
        run(`category-${categoryId}`, async () => {
            await deleteQuickItem(itemId)
            changeItems(categoryId, (items) => items.filter((item) => item.id !== itemId))
        })

    const categoryNameInput = (
        <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
                <input
                    aria-label={t('diet.library.categoryName')}
                    value={categoryDraft}
                    onChange={(e) => setCategoryDraft(e.target.value)}
                    onKeyDown={(event) => handleInlineKey(event, saveCategory, () => setEditingCategory(null))}
                    placeholder={t('diet.library.categoryName')}
                    maxLength={50}
                    autoFocus
                    className={`${inputClass} py-2 font-semibold`}
                />
            </div>
            <button type="button" onClick={saveCategory} disabled={busy} aria-label={t('diet.library.save')} className={chipButtonClass}>
                <Check className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setEditingCategory(null)} aria-label={t('diet.library.cancel')} className={chipButtonClass}>
                <X className="h-5 w-5" />
            </button>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Hazır öğünler */}
            <section className="space-y-3">
                <div className="rounded-3xl bg-card px-4 py-3 shadow-soft">
                    <h2 className="text-lg font-bold text-ink">{t('diet.library.mealsTitle')}</h2>
                    <p className="text-sm text-muted">{t('diet.library.mealsHint')}</p>
                </div>

                {library.meals.map((meal) =>
                    editingMeal === meal.id ? (
                        <div key={meal.id}>{mealForm}</div>
                    ) : (
                        <article key={meal.id} className="rounded-3xl bg-card p-4 shadow-soft">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-ink">
                                    {meal.name}
                                    {meal.time && <span className="ml-2 text-sm font-normal text-muted">{meal.time}</span>}
                                </h3>
                                <div className="flex shrink-0 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => startMealEdit(meal)}
                                        aria-label={t('diet.edit')}
                                        className="rounded-full p-2 text-muted hover:bg-cream hover:text-brand"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void removeMeal(meal.id)}
                                        disabled={busy}
                                        aria-label={t('diet.delete')}
                                        className="rounded-full p-2 text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            {itemLines(meal.items).length > 0 ? (
                                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink">
                                    {itemLines(meal.items).map((line, index) => (
                                        <li key={index}>{line}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-1 text-xs text-muted">{t('diet.library.noItems')}</p>
                            )}
                            {errorAt(`meal-${meal.id}`)}
                        </article>
                    ),
                )}

                {editingMeal === 'new' ? (
                    mealForm
                ) : (
                    <button
                        type="button"
                        onClick={() => startMealEdit(null)}
                        className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-brand bg-card px-4 py-3 text-sm font-semibold text-brand hover:bg-cream"
                    >
                        <Plus className="h-4 w-4" />
                        {t('diet.library.newMeal')}
                    </button>
                )}
            </section>

            {/* Hızlı maddeler */}
            <section className="space-y-3">
                <div className="rounded-3xl bg-card px-4 py-3 shadow-soft">
                    <h2 className="text-lg font-bold text-ink">{t('diet.library.itemsTitle')}</h2>
                    <p className="text-sm text-muted">{t('diet.library.itemsHint')}</p>
                </div>

                {library.categories.map((category) => (
                    <article key={category.id} className="rounded-3xl bg-card p-4 shadow-soft">
                        {editingCategory === category.id ? (
                            categoryNameInput
                        ) : (
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-ink">{category.name}</h3>
                                <div className="flex shrink-0 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingCategory(category.id)
                                            setCategoryDraft(category.name)
                                        }}
                                        aria-label={t('diet.library.renameCategory')}
                                        className="rounded-full p-2 text-muted hover:bg-cream hover:text-brand"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeCategory(category.id, category.name)}
                                        disabled={busy}
                                        aria-label={t('diet.library.deleteCategory')}
                                        className="rounded-full p-2 text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-2 flex flex-wrap gap-2">
                            {category.items.map((item) =>
                                editingItem === item.id ? (
                                    <span key={item.id} className="flex w-full items-center gap-1">
                                        <input
                                            aria-label={t('diet.library.itemText')}
                                            value={itemDraft}
                                            onChange={(e) => setItemDraft(e.target.value)}
                                            onKeyDown={(event) =>
                                                handleInlineKey(
                                                    event,
                                                    () => saveItem(category.id, item.id),
                                                    () => setEditingItem(null),
                                                )
                                            }
                                            maxLength={255}
                                            autoFocus
                                            className={`${inputClass} py-2 text-sm`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => saveItem(category.id, item.id)}
                                            aria-label={t('diet.library.save')}
                                            className={chipButtonClass}
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                    </span>
                                ) : (
                                    <span
                                        key={item.id}
                                        className="flex items-center gap-0.5 rounded-lg bg-mint/30 py-1 pl-2.5 pr-1 text-sm text-ink"
                                    >
                                        {item.text}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingItem(item.id)
                                                setAddingItemTo(null)
                                                setItemDraft(item.text)
                                            }}
                                            aria-label={t('diet.library.editItem')}
                                            className={chipButtonClass}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void removeItem(category.id, item.id)}
                                            disabled={busy}
                                            aria-label={t('diet.library.deleteItem')}
                                            className="rounded-full p-1 text-muted hover:bg-red-50 hover:text-red-700"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </span>
                                ),
                            )}

                            {addingItemTo === category.id ? (
                                <span className="flex w-full items-center gap-1">
                                    <input
                                        aria-label={t('diet.library.itemText')}
                                        value={itemDraft}
                                        onChange={(e) => setItemDraft(e.target.value)}
                                        onKeyDown={(event) =>
                                            handleInlineKey(
                                                event,
                                                () => saveNewItem(category.id),
                                                () => setAddingItemTo(null),
                                            )
                                        }
                                        placeholder={t('diet.library.itemPlaceholder')}
                                        maxLength={255}
                                        autoFocus
                                        className={`${inputClass} py-2 text-sm`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => saveNewItem(category.id)}
                                        disabled={busy}
                                        aria-label={t('diet.library.save')}
                                        className={chipButtonClass}
                                    >
                                        <Check className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAddingItemTo(null)}
                                        aria-label={t('diet.library.cancel')}
                                        className={chipButtonClass}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAddingItemTo(category.id)
                                        setEditingItem(null)
                                        setItemDraft('')
                                    }}
                                    className="rounded-lg border border-dashed border-brand px-2.5 py-1 text-sm font-semibold text-brand hover:bg-cream"
                                >
                                    + {t('diet.library.addItem')}
                                </button>
                            )}
                        </div>
                        {errorAt(`category-${category.id}`)}
                    </article>
                ))}

                {editingCategory === 'new' ? (
                    <div className="rounded-3xl bg-card p-4 shadow-soft ring-2 ring-brand">
                        {categoryNameInput}
                        {errorAt('category-new')}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingCategory('new')
                            setCategoryDraft('')
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-brand bg-card px-4 py-3 text-sm font-semibold text-brand hover:bg-cream"
                    >
                        <Plus className="h-4 w-4" />
                        {t('diet.library.newCategory')}
                    </button>
                )}
            </section>
        </div>
    )
}

export default DietLibraryManager
