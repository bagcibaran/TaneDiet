import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowLeft, ArrowUp, CalendarRange, Copy, Star, Trash2 } from 'lucide-react'

import { PageBody, PageHero } from '../components/PageLayout'
import DayTabs from '../components/diet/DayTabs'
import LibrarySheet from '../components/diet/LibrarySheet'
import { useFeedback } from '../components/feedback/useFeedback'
import { LoadingCards } from '../components/Skeleton'
import QuickPanel from '../components/diet/QuickPanel'
import { errorTextClass, inputClass, labelClass, primaryButtonClass } from '../components/ui'
import { WEEKDAYS, isSameMeal, mealsOfDay, sortTemplates } from '../diet/dietUtils'
import { createDietPlan, getClientDietPlans, updateDietPlan } from '../services/dietService'
import { createMealTemplate, getDietLibrary, updateMealTemplate } from '../services/dietLibraryService'
import { toErrorMessage } from '../services/errorMessage'
import type { DietPlan, DietPlanRequest, PlanType } from '../types/diet'
import type { DietLibrary, MealTemplate } from '../types/dietLibrary'
import { usePageTitle } from '../hooks/usePageTitle'

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
    usePageTitle(t('diet.sectionTitle'))
    const navigate = useNavigate()
    const { toast, confirm } = useFeedback()
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
    // Diyetisyenin hazır öğünleri ve hızlı maddeleri (yüklenemezse editör yine çalışır)
    const [library, setLibrary] = useState<DietLibrary | null>(null)
    const [libraryError, setLibraryError] = useState<unknown>(null)
    const [sheetOpen, setSheetOpen] = useState(false)
    // Öğün kartının altında kısa bir bilgi ("kaydedildi") ya da hata
    const [cardNotice, setCardNotice] = useState<{ key: string; messageKey: string; isError: boolean; error?: unknown } | null>(
        null,
    )
    const noticeTimer = useRef<number | undefined>(undefined)
    // "Hazır öğün yap": aynı ad ve saatte hazır öğün varsa kartta "güncelle / yeni ekle" sorusu
    const [templateChoice, setTemplateChoice] = useState<{ mealKey: string; match: MealTemplate } | null>(null)
    const [templateSaving, setTemplateSaving] = useState(false)
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

    // Hazırlar ayrı yüklenir: yüklenemezse program yine yazılıp kaydedilebilir
    useEffect(() => {
        let cancelled = false
        getDietLibrary()
            .then((result) => {
                if (!cancelled) {
                    setLibrary(result)
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setLibraryError(error)
                }
            })
        return () => {
            cancelled = true
        }
    }, [])

    const closeSheet = useCallback(() => setSheetOpen(false), [])

    const updateMeals = (dayIndex: number, change: (meals: EditorMeal[]) => EditorMeal[]) =>
        setDays((current) => ({ ...current, [dayIndex]: change(current[dayIndex] ?? []) }))

    const updateMeal = (key: string, patch: Partial<EditorMeal>) =>
        updateMeals(currentDay, (list) => list.map((meal) => (meal.key === key ? { ...meal, ...patch } : meal)))

    // Hazır öğünün (ya da boş öğünün) bir kopyası o güne eklenir; hazır öğün değişmez
    const addMeal = (template: { name: string; time: string | null; items: string }) => {
        const meal = { ...emptyMeal(template.name, template.time ?? ''), items: template.items }
        updateMeals(currentDay, (list) => [...list, meal])
        setSelectedKey(meal.key)
    }

    // Öğün kartının altında birkaç saniye görünen bilgi ya da hata
    const showNotice = (key: string, messageKey: string, isError: boolean, error?: unknown) => {
        setCardNotice({ key, messageKey, isError, error })
        window.clearTimeout(noticeTimer.current)
        noticeTimer.current = window.setTimeout(() => setCardNotice(null), 2500)
    }

    // replaceId verilirse o hazır öğün güncellenir, yoksa yeni hazır öğün eklenir
    const storeTemplate = async (meal: EditorMeal, replaceId: number | null) => {
        const request = { name: meal.name.trim(), time: meal.time.trim() === '' ? null : meal.time, items: meal.items }
        setTemplateSaving(true)
        try {
            const saved = replaceId === null ? await createMealTemplate(request) : await updateMealTemplate(replaceId, request)
            setLibrary((current) =>
                current
                    ? {
                          ...current,
                          meals: sortTemplates(
                              replaceId === null
                                  ? [...current.meals, saved]
                                  : current.meals.map((template) => (template.id === saved.id ? saved : template)),
                          ),
                      }
                    : current,
            )
            setTemplateChoice(null)
            showNotice(meal.key, 'diet.editor.templateSaved', false)
        } catch (error) {
            showNotice(meal.key, 'diet.library.saveError', true, error)
        } finally {
            setTemplateSaving(false)
        }
    }

    // "Hazır öğün yap": aynısı (ad + saat) yoksa hemen kaydeder, varsa kartta sorar
    const saveAsTemplate = (meal: EditorMeal) => {
        setTemplateChoice(null)
        if (meal.name.trim() === '') {
            showNotice(meal.key, 'diet.editor.templateNeedsName', true)
            return
        }
        const match = library?.meals.find((template) => isSameMeal(template, meal))
        if (match) {
            setTemplateChoice({ mealKey: meal.key, match })
            return
        }
        void storeTemplate(meal, null)
    }

    // "Tüm günlere ekle" (haftalık): diğer günlerde aynı öğün (ad + saat) varsa maddeleri değişir, yoksa sona eklenir
    const addToAllDays = (meal: EditorMeal) => {
        setDays((current) => {
            const next = { ...current }
            for (const weekday of WEEKDAYS) {
                if (weekday === day) {
                    continue
                }
                const list = current[weekday] ?? []
                const index = list.findIndex((other) => isSameMeal(other, meal))
                next[weekday] =
                    index >= 0
                        ? list.map((other, i) => (i === index ? { ...other, items: meal.items } : other))
                        : [...list, { ...meal, key: newKey() }]
            }
            return next
        })
        showNotice(meal.key, 'diet.editor.addedToAllDays', false)
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

    const changeType = async (next: PlanType) => {
        if (next === planType) {
            return
        }
        if (next === 'WEEKLY') {
            // Günlük liste bütün günlere kopyalanır, sonra gün gün değiştirilebilir
            const base = days[0] ?? []
            setDays(Object.fromEntries(WEEKDAYS.map((weekday) => [weekday, cloneMeals(base)])))
            setDay(1)
        } else {
            const ok = await confirm({
                title: t('diet.editor.toDailyConfirm', { day: t(`diet.days.long.${day}`) }),
                confirmLabel: t('common.continue'),
            })
            if (!ok) {
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
            toast(t('diet.editor.savedToast'))
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
                {loading && <LoadingCards count={3} label={t('dashboard.loading')} />}
                {loadError !== null && (
                    <p className="rounded-3xl bg-card p-5 text-danger shadow-soft">
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
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand bg-card px-4 py-3 text-sm font-semibold text-brand hover:bg-cream"
                            >
                                <Copy className="h-4 w-4" />
                                {t('diet.editor.startFromCurrent', { title: activePlan.title })}
                            </button>
                        )}

                        {/* Program bilgileri */}
                        <section className="space-y-4 rounded-3xl bg-card p-5 shadow-soft">
                            <div className="flex gap-2">
                                {(['DAILY', 'WEEKLY'] as PlanType[]).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => void changeType(type)}
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

                        {/* Hızlı seçim: üstten tek dokunuşla hazır öğün ve madde ekleme */}
                        <QuickPanel
                            library={library}
                            loadError={libraryError}
                            optionMode={optionMode}
                            onOptionModeChange={setOptionMode}
                            onAddMeal={addMeal}
                            onAddItem={addQuickItem}
                            onEdit={() => setSheetOpen(true)}
                        />

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
                                    <div className="space-y-3 rounded-3xl bg-card p-4 shadow-soft">
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
                                    className={`space-y-2 rounded-3xl bg-card p-4 shadow-soft transition ${
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
                                    {/* Solda yazı düğmeleri, sağda sıra ve silme. Dar ekranda gruplar bütün olarak alt satıra iner. */}
                                    <div className="flex flex-wrap items-center justify-between gap-1">
                                        <div className="flex flex-wrap gap-1">
                                            <button
                                                type="button"
                                                onClick={() => saveAsTemplate(meal)}
                                                disabled={templateSaving || library === null}
                                                className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand hover:border-brand disabled:opacity-40"
                                            >
                                                <Star className="h-3.5 w-3.5" />
                                                {t('diet.editor.saveAsTemplate')}
                                            </button>
                                            {planType === 'WEEKLY' && (
                                                <button
                                                    type="button"
                                                    onClick={() => addToAllDays(meal)}
                                                    className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand hover:border-brand"
                                                >
                                                    <CalendarRange className="h-3.5 w-3.5" />
                                                    {t('diet.editor.addToAllDays')}
                                                </button>
                                            )}
                                        </div>
                                        <div className="ml-auto flex gap-1">
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
                                                className="rounded-full p-2 text-danger hover:bg-danger-soft"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Aynı ad ve saatte hazır öğün var: güncellensin mi, yeni mi eklensin? */}
                                    {templateChoice?.mealKey === meal.key && (
                                        <div className="space-y-2 rounded-2xl bg-cream p-3">
                                            <p className="text-sm text-ink">
                                                {t('diet.editor.templateExists', { name: templateChoice.match.name })}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => void storeTemplate(meal, templateChoice.match.id)}
                                                    disabled={templateSaving}
                                                    className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-cream hover:bg-brand-dark disabled:opacity-50"
                                                >
                                                    {t('diet.editor.updateExisting')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => void storeTemplate(meal, null)}
                                                    disabled={templateSaving}
                                                    className="rounded-full border border-brand px-3 py-1.5 text-xs font-semibold text-brand hover:bg-card disabled:opacity-50"
                                                >
                                                    {t('diet.editor.addAsNew')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setTemplateChoice(null)}
                                                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:text-brand"
                                                >
                                                    {t('diet.library.cancel')}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {cardNotice?.key === meal.key && (
                                        <p
                                            role="status"
                                            className={`text-sm font-semibold ${cardNotice.isError ? 'text-danger' : 'text-brand'}`}
                                        >
                                            {cardNotice.error !== undefined
                                                ? toErrorMessage(cardNotice.error, t, cardNotice.messageKey)
                                                : t(cardNotice.messageKey)}
                                        </p>
                                    )}
                                </article>
                            ))}

                        </section>

                        {/* Genel not */}
                        <section className="rounded-3xl bg-card p-5 shadow-soft">
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

            {library && (
                <LibrarySheet
                    open={sheetOpen}
                    library={library}
                    onChange={(update) => setLibrary((current) => (current ? update(current) : current))}
                    onClose={closeSheet}
                />
            )}
        </>
    )
}

export default DietPlanEditorPage
