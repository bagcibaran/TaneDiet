import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowLeft, ArrowUp, Copy, Plus, Trash2, Zap } from 'lucide-react'

import { PageBody, PageHero } from '../components/PageLayout'
import DayTabs from '../components/diet/DayTabs'
import { errorTextClass, inputClass, labelClass, primaryButtonClass } from '../components/ui'
import { MEAL_PRESETS, QUICK_PICKS } from '../diet/quickPicks'
import { WEEKDAYS, mealsOfDay } from '../diet/dietUtils'
import { createDietPlan, getClientDietPlans, updateDietPlan } from '../services/dietService'
import { toErrorMessage } from '../services/errorMessage'
import type { DietPlan, DietPlanRequest, PlanType } from '../types/diet'

// Ekranda düzenlenen öğün. key yalnızca React listesi ve seçim için (kaydedilmez).
type EditorMeal = {
    key: string
    name: string
    time: string
    items: string
}

// dayIndex → o günün öğünleri (günlük programda yalnızca 0)
type EditorDays = Record<number, EditorMeal[]>

let keyCounter = 0
const newKey = () => `meal-${++keyCounter}`

const emptyMeal = (name: string, time: string): EditorMeal => ({ key: newKey(), name, time, items: '' })

// Yeni bir program için başlangıç öğünleri
const starterMeals = (): EditorMeal[] => [emptyMeal('Kahvaltı', '09:00'), emptyMeal('Öğle', '13:00'), emptyMeal('Akşam', '19:00')]

const cloneMeals = (meals: EditorMeal[]): EditorMeal[] => meals.map((meal) => ({ ...meal, key: newKey() }))

function todayString(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Kayıtlı bir programı düzenleme ekranının şekline çevirir
function daysFromPlan(plan: DietPlan): EditorDays {
    const toEditor = (dayIndex: number) =>
        mealsOfDay(plan.meals, dayIndex).map((meal) => ({
            key: newKey(),
            name: meal.name,
            time: meal.time ?? '',
            items: meal.items,
        }))
    if (plan.planType === 'DAILY') {
        return { 0: toEditor(0) }
    }
    return Object.fromEntries(WEEKDAYS.map((day) => [day, toEditor(day)]))
}

// Diyetisyenin program yazma/düzenleme ekranı: /clients/:id/diet-plans/new ve /clients/:id/diet-plans/:planId
function DietPlanEditorPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id, planId } = useParams()
    const clientId = Number(id)
    const editingId = planId === undefined || planId === 'new' ? null : Number(planId)

    const [planType, setPlanType] = useState<PlanType>('DAILY')
    const [title, setTitle] = useState('Diyet Listesi')
    const [startDate, setStartDate] = useState(todayString())
    const [notes, setNotes] = useState('')
    const [days, setDays] = useState<EditorDays>({ 0: starterMeals() })
    const [day, setDay] = useState(1)
    const [selectedKey, setSelectedKey] = useState<string | null>(null)
    // Açıksa hızlı seçimden gelen madde son satıra " / " ile seçenek olarak eklenir
    const [optionMode, setOptionMode] = useState(false)
    const [pickCategory, setPickCategory] = useState(QUICK_PICKS[0].key)
    const [copyTargets, setCopyTargets] = useState<number[]>([])
    const [showCopy, setShowCopy] = useState(false)
    // Yeni programda "mevcut programdan başla" için
    const [activePlan, setActivePlan] = useState<DietPlan | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<unknown>(null)
    const [saveError, setSaveError] = useState('')
    const [saving, setSaving] = useState(false)
    const flashTimer = useRef<number | undefined>(undefined)
    const [flashKey, setFlashKey] = useState<string | null>(null)

    const currentDay = planType === 'DAILY' ? 0 : day
    const meals = days[currentDay] ?? []

    // Bir programı ekrana yükler. keepMeta: başlık ve tarih de alınsın mı (düzenleme) yoksa yalnızca öğünler ve not mu (kopya)
    const loadPlan = (plan: DietPlan, keepMeta: boolean) => {
        setPlanType(plan.planType)
        setDays(daysFromPlan(plan))
        setDay(1)
        setSelectedKey(null)
        setNotes(plan.notes ?? '')
        if (keepMeta) {
            setTitle(plan.title)
            setStartDate(plan.startDate)
        }
    }

    // Programlar sayfa açılınca bir kez yüklenir
    useEffect(() => {
        if (Number.isNaN(clientId)) {
            return
        }
        getClientDietPlans(clientId)
            .then((plans) => {
                if (editingId !== null) {
                    const plan = plans.find((item) => item.id === editingId)
                    if (!plan) {
                        setLoadError(new Error('not found'))
                        return
                    }
                    loadPlan(plan, true)
                } else {
                    setActivePlan(plans[0] ?? null)
                }
            })
            .catch(setLoadError)
            .finally(() => setLoading(false))
    }, [clientId, editingId])

    const updateMeals = (dayIndex: number, change: (meals: EditorMeal[]) => EditorMeal[]) =>
        setDays((current) => ({ ...current, [dayIndex]: change(current[dayIndex] ?? []) }))

    const updateMeal = (key: string, patch: Partial<EditorMeal>) =>
        updateMeals(currentDay, (list) => list.map((meal) => (meal.key === key ? { ...meal, ...patch } : meal)))

    const addMeal = (name: string, time: string) => {
        const meal = emptyMeal(name, time)
        updateMeals(currentDay, (list) => [...list, meal])
        setSelectedKey(meal.key)
    }

    const moveMeal = (key: string, direction: -1 | 1) =>
        updateMeals(currentDay, (list) => {
            const index = list.findIndex((meal) => meal.key === key)
            const target = index + direction
            if (index < 0 || target < 0 || target >= list.length) {
                return list
            }
            const next = [...list]
            ;[next[index], next[target]] = [next[target], next[index]]
            return next
        })

    const removeMeal = (key: string) => {
        updateMeals(currentDay, (list) => list.filter((meal) => meal.key !== key))
        if (selectedKey === key) {
            setSelectedKey(null)
        }
    }

    // Hızlı seçim: seçili öğüne yeni satır, ya da seçenek modunda son satıra " / " ile ekle
    const addQuickItem = (item: string) => {
        const target = meals.find((meal) => meal.key === selectedKey) ?? meals[meals.length - 1]
        if (!target) {
            setSaveError(t('diet.editor.addMealFirst'))
            return
        }
        const lines = target.items.split('\n')
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
            lines.pop()
        }
        if (optionMode && lines.length > 0) {
            lines[lines.length - 1] = `${lines[lines.length - 1].trim()} / ${item}`
        } else {
            lines.push(item)
        }
        updateMeal(target.key, { items: lines.join('\n') })
        setSelectedKey(target.key)
        // Eklendiğini göstermek için öğün kartı kısa bir süre parlar
        setFlashKey(target.key)
        window.clearTimeout(flashTimer.current)
        flashTimer.current = window.setTimeout(() => setFlashKey(null), 600)
    }

    const changeType = (next: PlanType) => {
        if (next === planType) {
            return
        }
        if (next === 'WEEKLY') {
            // Günlük liste bütün günlere kopyalanır, sonra gün gün değiştirilebilir
            const base = days[0] ?? []
            setDays(Object.fromEntries(WEEKDAYS.map((weekday) => [weekday, cloneMeals(base)])))
            setDay(1)
        } else {
            if (!window.confirm(t('diet.editor.toDailyConfirm', { day: t(`diet.days.long.${day}`) }))) {
                return
            }
            setDays({ 0: cloneMeals(days[day] ?? []) })
        }
        setPlanType(next)
        setSelectedKey(null)
    }

    const copyDay = () => {
        if (copyTargets.length === 0) {
            return
        }
        const source = days[day] ?? []
        setDays((current) => {
            const next = { ...current }
            for (const target of copyTargets) {
                next[target] = cloneMeals(source)
            }
            return next
        })
        setCopyTargets([])
        setShowCopy(false)
    }

    const handleSave = async () => {
        setSaveError('')
        const dayIndexes = planType === 'DAILY' ? [0] : [...WEEKDAYS]
        const request: DietPlanRequest = {
            planType,
            title: title.trim(),
            startDate,
            notes: notes.trim() === '' ? null : notes,
            meals: dayIndexes.flatMap((dayIndex) =>
                (days[dayIndex] ?? []).map((meal) => ({
                    dayIndex,
                    name: meal.name.trim(),
                    time: meal.time.trim() === '' ? null : meal.time,
                    items: meal.items,
                })),
            ),
        }

        if (request.title === '') {
            setSaveError(t('diet.editor.titleRequired'))
            return
        }
        if (request.meals.length === 0) {
            setSaveError(t('diet.editor.noMeals'))
            return
        }
        const incomplete = request.meals.find((meal) => meal.name === '' || meal.items.trim() === '')
        if (incomplete) {
            setSaveError(
                planType === 'WEEKLY'
                    ? t('diet.editor.incompleteMealOnDay', { day: t(`diet.days.long.${incomplete.dayIndex}`) })
                    : t('diet.editor.incompleteMeal'),
            )
            if (planType === 'WEEKLY') {
                setDay(incomplete.dayIndex)
            }
            return
        }

        setSaving(true)
        try {
            if (editingId !== null) {
                await updateDietPlan(clientId, editingId, request)
            } else {
                await createDietPlan(clientId, request)
            }
            navigate(`/clients/${clientId}`)
        } catch (error) {
            setSaveError(toErrorMessage(error, t, 'diet.editor.saveError'))
        } finally {
            setSaving(false)
        }
    }

    if (Number.isNaN(clientId)) {
        return <Navigate to="/clients" replace />
    }

    const category = QUICK_PICKS.find((item) => item.key === pickCategory) ?? QUICK_PICKS[0]
    const chipClass = (active: boolean) =>
        `shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
            active ? 'border-brand bg-brand text-cream' : 'border-line bg-cream text-muted hover:border-brand hover:text-brand'
        }`

    return (
        <>
            <PageHero>
                <Link
                    to={`/clients/${clientId}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-mint hover:text-cream"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('diet.editor.back')}
                </Link>
                <h1 className="mt-2 text-2xl font-bold tracking-tight">
                    {editingId !== null ? t('diet.editor.editTitle') : t('diet.editor.newTitle')}
                </h1>
            </PageHero>

            <PageBody>
                {loading && <p className="rounded-2xl bg-card p-5 text-muted shadow-sm">{t('dashboard.loading')}</p>}
                {loadError !== null && (
                    <p className="rounded-2xl bg-card p-5 text-red-700 shadow-sm">
                        {toErrorMessage(loadError, t, 'diet.loadError')}
                    </p>
                )}

                {!loading && loadError === null && (
                    <div className="space-y-4 pb-6">
                        {/* Mevcut programdan başla (yalnızca yeni programda) */}
                        {editingId === null && activePlan && (
                            <button
                                type="button"
                                onClick={() => loadPlan(activePlan, false)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand bg-card px-4 py-3 text-sm font-semibold text-brand hover:bg-cream"
                            >
                                <Copy className="h-4 w-4" />
                                {t('diet.editor.startFromCurrent', { title: activePlan.title })}
                            </button>
                        )}

                        {/* Program bilgileri */}
                        <section className="space-y-4 rounded-2xl bg-card p-5 shadow-sm">
                            <div className="flex gap-2">
                                {(['DAILY', 'WEEKLY'] as PlanType[]).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => changeType(type)}
                                        className={`flex-1 ${chipClass(planType === type)} py-2`}
                                    >
                                        {t(`diet.type.${type}`)}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="plan-title" className={labelClass}>
                                        {t('diet.editor.title')}
                                    </label>
                                    <input id="plan-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label htmlFor="plan-start" className={labelClass}>
                                        {t('diet.editor.startDate')}
                                    </label>
                                    <input
                                        id="plan-start"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Hızlı seçim: üstten tek dokunuşla öğün ve madde ekleme */}
                        <section className="sticky top-0 z-30 space-y-3 rounded-2xl bg-card p-4 shadow-md">
                            <div className="flex items-center justify-between gap-2">
                                <p className="flex items-center gap-1 text-sm font-bold text-ink">
                                    <Zap className="h-4 w-4 text-brand" />
                                    {t('diet.editor.quickAdd')}
                                </p>
                                <label className="flex items-center gap-2 text-xs font-semibold text-muted">
                                    <input
                                        type="checkbox"
                                        checked={optionMode}
                                        onChange={(e) => setOptionMode(e.target.checked)}
                                        className="h-4 w-4 accent-brand"
                                    />
                                    {t('diet.editor.addAsOption')}
                                </label>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {QUICK_PICKS.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setPickCategory(item.key)}
                                        className={chipClass(pickCategory === item.key)}
                                    >
                                        {t(`diet.quick.${item.key}`)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                                {category.items.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => addQuickItem(item)}
                                        className="rounded-lg bg-mint/30 px-2.5 py-1.5 text-left text-sm text-ink hover:bg-mint/60"
                                    >
                                        + {item}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Haftalık programda gün seçimi ve kopyalama */}
                        {planType === 'WEEKLY' && (
                            <section className="space-y-2">
                                <DayTabs selected={day} onSelect={(next) => { setDay(next); setSelectedKey(null) }} />
                                <div className="flex items-center justify-between px-1">
                                    <h2 className="text-lg font-bold text-ink">{t(`diet.days.long.${day}`)}</h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowCopy((value) => !value)}
                                        className="flex items-center gap-1 text-sm font-semibold text-brand"
                                    >
                                        <Copy className="h-4 w-4" />
                                        {t('diet.editor.copyDay')}
                                    </button>
                                </div>
                                {showCopy && (
                                    <div className="space-y-3 rounded-xl bg-card p-4 shadow-sm">
                                        <p className="text-sm text-muted">
                                            {t('diet.editor.copyTo', { day: t(`diet.days.long.${day}`) })}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {WEEKDAYS.filter((weekday) => weekday !== day).map((weekday) => (
                                                <button
                                                    key={weekday}
                                                    type="button"
                                                    onClick={() =>
                                                        setCopyTargets((current) =>
                                                            current.includes(weekday)
                                                                ? current.filter((item) => item !== weekday)
                                                                : [...current, weekday],
                                                        )
                                                    }
                                                    className={chipClass(copyTargets.includes(weekday))}
                                                >
                                                    {t(`diet.days.short.${weekday}`)}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={copyDay}
                                            disabled={copyTargets.length === 0}
                                            className={primaryButtonClass}
                                        >
                                            {t('diet.editor.copyConfirm', { count: copyTargets.length })}
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Öğünler */}
                        <section className="space-y-3">
                            {meals.map((meal, index) => (
                                <article
                                    key={meal.key}
                                    onFocusCapture={() => setSelectedKey(meal.key)}
                                    onClick={() => setSelectedKey(meal.key)}
                                    className={`space-y-2 rounded-2xl bg-card p-4 shadow-sm transition ${
                                        selectedKey === meal.key ? 'ring-2 ring-brand' : ''
                                    } ${flashKey === meal.key ? 'bg-mint/40' : ''}`}
                                >
                                    {/* Ad geniş, saat dar: genişlikleri sarmalayıcı div'ler belirliyor (inputClass içindeki w-full ile çakışmasın) */}
                                    <div className="flex items-center gap-2">
                                        <div className="min-w-0 flex-1">
                                            <input
                                                aria-label={t('diet.editor.mealName')}
                                                value={meal.name}
                                                onChange={(e) => updateMeal(meal.key, { name: e.target.value })}
                                                placeholder={t('diet.editor.mealName')}
                                                className={`${inputClass} font-semibold`}
                                            />
                                        </div>
                                        <div className="w-28 shrink-0">
                                            <input
                                                aria-label={t('diet.editor.mealTime')}
                                                type="time"
                                                value={meal.time}
                                                onChange={(e) => updateMeal(meal.key, { time: e.target.value })}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <textarea
                                        aria-label={t('diet.editor.items')}
                                        rows={Math.max(3, meal.items.split('\n').length + 1)}
                                        value={meal.items}
                                        onChange={(e) => updateMeal(meal.key, { items: e.target.value })}
                                        placeholder={t('diet.editor.itemsPlaceholder')}
                                        className={inputClass}
                                    />
                                    <div className="flex justify-end gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveMeal(meal.key, -1)}
                                            disabled={index === 0}
                                            aria-label={t('diet.editor.moveUp')}
                                            className="rounded-full p-2 text-muted hover:bg-cream disabled:opacity-30"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveMeal(meal.key, 1)}
                                            disabled={index === meals.length - 1}
                                            aria-label={t('diet.editor.moveDown')}
                                            className="rounded-full p-2 text-muted hover:bg-cream disabled:opacity-30"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeMeal(meal.key)}
                                            aria-label={t('diet.editor.removeMeal')}
                                            className="rounded-full p-2 text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </article>
                            ))}

                            {/* Öğün ekle: hazır öğün adları ve saatleri */}
                            <div className="rounded-2xl border border-dashed border-line bg-card p-4">
                                <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-muted">
                                    <Plus className="h-4 w-4" />
                                    {t('diet.editor.addMeal')}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {MEAL_PRESETS.map((preset, index) => (
                                        <button
                                            key={`${preset.name}-${index}`}
                                            type="button"
                                            onClick={() => addMeal(preset.name, preset.time)}
                                            className={chipClass(false)}
                                        >
                                            {preset.name} · {preset.time}
                                        </button>
                                    ))}
                                    <button type="button" onClick={() => addMeal('', '')} className={chipClass(false)}>
                                        {t('diet.editor.customMeal')}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Genel not */}
                        <section className="rounded-2xl bg-card p-5 shadow-sm">
                            <label htmlFor="plan-notes" className={labelClass}>
                                {t('diet.editor.notes')}
                            </label>
                            <textarea
                                id="plan-notes"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('diet.editor.notesPlaceholder')}
                                className={inputClass}
                            />
                        </section>

                        {saveError && <p className={errorTextClass}>{saveError}</p>}

                        <button type="button" onClick={handleSave} disabled={saving} className={primaryButtonClass}>
                            {saving ? t('diet.editor.saving') : t('diet.editor.save')}
                        </button>
                    </div>
                )}
            </PageBody>
        </>
    )
}

export default DietPlanEditorPage
