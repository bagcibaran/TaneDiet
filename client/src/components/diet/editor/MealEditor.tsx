import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, CalendarRange, MousePointerClick, Star, Trash2 } from 'lucide-react'

import { inputClass } from '../../ui'
import { toErrorMessage } from '../../../services/errorMessage'
import type { EditorMeal } from './types'
import type { MealTemplate } from '../../../types/dietLibrary'

export type MealNotice = { messageKey: string; isError: boolean; error?: unknown }

type MealEditorProps = {
    // null: açık öğün yok (boş durum)
    meal: EditorMeal | null
    isWeekly: boolean
    isFirst: boolean
    isLast: boolean
    // Madde eklenince kısa süre parlar
    flash: boolean
    templateBusy: boolean
    libraryReady: boolean
    notice: MealNotice | null
    // "Hazır öğün yap": aynı ad ve saatte hazır öğün varsa güncelle / yeni ekle sorusu
    templateMatch: MealTemplate | null
    onChange: (patch: Partial<EditorMeal>) => void
    onMove: (direction: -1 | 1) => void
    onRemove: () => void
    onSaveTemplate: () => void
    onAddToAllDays: () => void
    onStoreTemplate: (replaceId: number | null) => void
    onCancelTemplate: () => void
}

const smallButton =
    'flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand hover:border-brand disabled:opacity-40'

// Ortadaki büyük kart: açık öğünün adı, saati ve maddeleri (her satır bir madde, " / " ile seçenek)
function MealEditor({
    meal,
    isWeekly,
    isFirst,
    isLast,
    flash,
    templateBusy,
    libraryReady,
    notice,
    templateMatch,
    onChange,
    onMove,
    onRemove,
    onSaveTemplate,
    onAddToAllDays,
    onStoreTemplate,
    onCancelTemplate,
}: MealEditorProps) {
    const { t } = useTranslation()

    if (meal === null) {
        return (
            <section className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-line bg-card p-8 text-center">
                <MousePointerClick className="h-8 w-8 text-brand" />
                <p className="max-w-xs text-muted">{t('diet.editor.startHint')}</p>
            </section>
        )
    }

    return (
        <section className={`space-y-3 rounded-3xl bg-card p-5 shadow-soft transition ${flash ? 'bg-mint/40' : ''}`}>
            {/* Ad geniş, saat dar: genişlikleri sarmalayıcı div'ler belirliyor (inputClass içindeki w-full ile çakışmasın) */}
            <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                    <input
                        aria-label={t('diet.editor.mealName')}
                        value={meal.name}
                        onChange={(e) => onChange({ name: e.target.value })}
                        placeholder={t('diet.editor.mealName')}
                        className={`${inputClass} text-lg font-bold`}
                    />
                </div>
                <div className="w-28 shrink-0">
                    <input
                        aria-label={t('diet.editor.mealTime')}
                        type="time"
                        value={meal.time}
                        onChange={(e) => onChange({ time: e.target.value })}
                        className={inputClass}
                    />
                </div>
            </div>

            <textarea
                aria-label={t('diet.editor.items')}
                rows={Math.max(10, meal.items.split('\n').length + 1)}
                value={meal.items}
                onChange={(e) => onChange({ items: e.target.value })}
                placeholder={t('diet.editor.itemsPlaceholder')}
                className={`${inputClass} leading-relaxed`}
            />

            {/* Solda yazı düğmeleri, sağda sıra (büyük ekranda soldaki listede) ve silme */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={onSaveTemplate} disabled={templateBusy || !libraryReady} className={smallButton}>
                        <Star className="h-3.5 w-3.5" />
                        {t('diet.editor.saveAsTemplate')}
                    </button>
                    {isWeekly && (
                        <button type="button" onClick={onAddToAllDays} className={smallButton}>
                            <CalendarRange className="h-3.5 w-3.5" />
                            {t('diet.editor.addToAllDays')}
                        </button>
                    )}
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onMove(-1)}
                        disabled={isFirst}
                        aria-label={t('diet.editor.moveUp')}
                        className="rounded-full p-2 text-muted hover:bg-cream disabled:opacity-30 lg:hidden"
                    >
                        <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onMove(1)}
                        disabled={isLast}
                        aria-label={t('diet.editor.moveDown')}
                        className="rounded-full p-2 text-muted hover:bg-cream disabled:opacity-30 lg:hidden"
                    >
                        <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger-soft"
                    >
                        <Trash2 className="h-4 w-4" />
                        {t('diet.editor.removeMeal')}
                    </button>
                </div>
            </div>

            {/* Aynı ad ve saatte hazır öğün var: güncellensin mi, yeni mi eklensin? */}
            {templateMatch && (
                <div className="space-y-2 rounded-2xl bg-cream p-3">
                    <p className="text-sm text-ink">{t('diet.editor.templateExists', { name: templateMatch.name })}</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => onStoreTemplate(templateMatch.id)}
                            disabled={templateBusy}
                            className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-cream hover:bg-brand-dark disabled:opacity-50"
                        >
                            {t('diet.editor.updateExisting')}
                        </button>
                        <button
                            type="button"
                            onClick={() => onStoreTemplate(null)}
                            disabled={templateBusy}
                            className="rounded-full border border-brand px-3 py-1.5 text-xs font-semibold text-brand hover:bg-card disabled:opacity-50"
                        >
                            {t('diet.editor.addAsNew')}
                        </button>
                        <button
                            type="button"
                            onClick={onCancelTemplate}
                            className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:text-brand"
                        >
                            {t('diet.library.cancel')}
                        </button>
                    </div>
                </div>
            )}

            {notice && (
                <p role="status" className={`text-sm font-semibold ${notice.isError ? 'text-danger' : 'text-brand'}`}>
                    {notice.error !== undefined ? toErrorMessage(notice.error, t, notice.messageKey) : t(notice.messageKey)}
                </p>
            )}
        </section>
    )
}

export default MealEditor
