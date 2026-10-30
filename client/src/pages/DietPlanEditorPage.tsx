import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Copy, ListPlus } from 'lucide-react'

import { PageBody, PageHero } from '../components/PageLayout'
import DayTabs from '../components/diet/DayTabs'
import LibrarySheet from '../components/diet/LibrarySheet'
import BottomSheet from '../components/diet/editor/BottomSheet'
import ItemPicker from '../components/diet/editor/ItemPicker'
import MealEditor, { type MealNotice } from '../components/diet/editor/MealEditor'
import MealList from '../components/diet/editor/MealList'
import MealStrip from '../components/diet/editor/MealStrip'
import type { AddableMeal, EditorMeal } from '../components/diet/editor/types'
import { useFeedback } from '../components/feedback/useFeedback'
import { LoadingCards } from '../components/Skeleton'
import { errorTextClass, inputClass, labelClass, primaryButtonClass } from '../components/ui'
import { WEEKDAYS, isSameMeal, mealsOfDay, sortTemplates } from '../diet/dietUtils'
import { createDietPlan, getClientDietPlans, updateDietPlan } from '../services/dietService'
import { createMealTemplate, getDietLibrary, updateMealTemplate } from '../services/dietLibraryService'
import { toErrorMessage } from '../services/errorMessage'
import type { DietPlan, DietPlanRequest, PlanType } from '../types/diet'
import type { DietLibrary, MealTemplate } from '../types/dietLibrary'
import { usePageTitle } from '../hooks/usePageTitle'

// dayIndex → o günün öğünleri (günlük programda yalnızca 0)
type EditorDays = Record<number, EditorMeal[]>

let keyCounter = 0
const newKey = () => `meal-${++keyCounter}`

const cloneMeals = (meals: EditorMeal[]): EditorMeal[] => meals.map((meal) => ({ ...meal, key: newKey() }))

// Bir günün ilk öğünü (açık öğün olarak seçilir); gün boşsa null
const firstKey = (meals: EditorMeal[] | undefined): string | null => meals?.[0]?.key ?? null

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
// Büyük ekranda üç sütun (günün öğünleri · açık öğün · maddeler), dik tablette öğün şeridi + iki sütun,
// telefonda öğün şeridi + açık öğün + alttan açılan madde paneli.
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
    // Notlar bölümü: dolu bir program yüklenince açık gelir, sonra kullanıcı açıp kapatır
    const [notesOpen, setNotesOpen] = useState(false)
    // Yeni program boş başlar: öğünler tıklanınca eklenir
    const [days, setDays] = useState<EditorDays>({ 0: [] })
    const [day, setDay] = useState(1)
    // Açık (ortada düzenlenen) öğün; maddeler buna eklenir
    const [selectedKey, setSelectedKey] = useState<string | null>(null)
    // Açıksa hızlı seçimden gelen madde son satıra " / " ile seçenek olarak eklenir
    const [optionMode, setOptionMode] = useState(false)
    // Diyetisyenin hazır öğünleri ve hızlı maddeleri (yüklenemezse editör yine çalışır)
    const [library, setLibrary] = useState<DietLibrary | null>(null)
    const [libraryError, setLibraryError] = useState<unknown>(null)
    const [sheetOpen, setSheetOpen] = useState(false)
    // Telefonda alttan açılan madde paneli
    const [pickerOpen, setPickerOpen] = useState(false)
    // Öğün kartının altında kısa bir bilgi ("kaydedildi") ya da hata
    const [cardNotice, setCardNotice] = useState<(MealNotice & { key: string }) | null>(null)
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
    const selectedIndex = meals.findIndex((meal) => meal.key === selectedKey)
    const selectedMeal = selectedIndex >= 0 ? meals[selectedIndex] : null

    // Bir programı ekrana yükler. keepMeta: başlık ve tarih de alınsın mı (düzenleme) yoksa yalnızca öğünler ve not mu (kopya)
    const loadPlan = (plan: DietPlan, keepMeta: boolean) => {
        const loaded = daysFromPlan(plan)
        setPlanType(plan.planType)
        setDays(loaded)
        setDay(1)
        setSelectedKey(firstKey(loaded[plan.planType === 'DAILY' ? 0 : 1]))
        setNotes(plan.notes ?? '')
        setNotesOpen((plan.notes ?? '').trim() !== '')
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
    const closePicker = useCallback(() => setPickerOpen(false), [])

    const updateMeals = (dayIndex: number, change: (meals: EditorMeal[]) => EditorMeal[]) =>
        setDays((current) => ({ ...current, [dayIndex]: change(current[dayIndex] ?? []) }))

    const updateMeal = (key: string, patch: Partial<EditorMeal>) =>
        updateMeals(currentDay, (list) => list.map((meal) => (meal.key === key ? { ...meal, ...patch } : meal)))

    const selectDay = (next: number) => {
        // Kopyalama hedeflerinde yeni gün kalmasın (gün kendi üstüne kopyalanırsa açık öğün kaybolurdu)
        setCopyTargets((current) => current.filter((target) => target !== next))
        setDay(next)
        setSelectedKey(firstKey(days[next]))
        setTemplateChoice(null)
    }

    // Hazır öğünün (ya da boş öğünün) bir kopyası o günün sonuna eklenir ve açılır; hazır öğün değişmez
    const addMeal = (template: AddableMeal) => {
        const meal: EditorMeal = { key: newKey(), name: template.name, time: template.time ?? '', items: template.items }
        updateMeals(currentDay, (list) => [...list, meal])
        setSelectedKey(meal.key)
        setTemplateChoice(null)
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

    // Maddesi dolu öğün sorularak silinir; sonra komşusu (sonraki, yoksa önceki) açılır
    const removeMeal = async (key: string) => {
        const index = meals.findIndex((meal) => meal.key === key)
        const meal = meals[index]
        if (!meal) {
            return
        }
        if (meal.items.trim() !== '') {
            const ok = await confirm({
                title: t('diet.editor.confirmRemoveMeal', { name: meal.name.trim() || t('diet.editor.unnamedMeal') }),
                confirmLabel: t('common.delete'),
                danger: true,
            })
            if (!ok) {
                return
            }
        }
        const remaining = meals.filter((item) => item.key !== key)
        updateMeals(currentDay, (list) => list.filter((item) => item.key !== key))
        setSelectedKey(remaining[index]?.key ?? remaining[index - 1]?.key ?? null)
        setTemplateChoice(null)
    }

    // Hızlı seçim: açık öğüne yeni satır, ya da seçenek modunda son satıra " / " ile ekle
    const addQuickItem = (item: string) => {
        if (!selectedMeal) {
            return
        }
        const lines = selectedMeal.items.split('\n')
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
            lines.pop()
        }
        if (optionMode && lines.length > 0) {
            lines[lines.length - 1] = `${lines[lines.length - 1].trim()} / ${item}`
        } else {
            lines.push(item)
        }
        updateMeal(selectedMeal.key, { items: lines.join('\n') })
        // Eklendiğini göstermek için öğün kartı kısa bir süre parlar
        setFlashKey(selectedMeal.key)
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
            const weekly: EditorDays = Object.fromEntries(WEEKDAYS.map((weekday) => [weekday, cloneMeals(base)]))
            setDays(weekly)
            setDay(1)
            setSelectedKey(firstKey(weekly[1]))
        } else {
            const ok = await confirm({
                title: t('diet.editor.toDailyConfirm', { day: t(`diet.days.long.${day}`) }),
                confirmLabel: t('common.continue'),
            })
            if (!ok) {
                return
            }
            const daily = cloneMeals(days[day] ?? [])
            setDays({ 0: daily })
            setSelectedKey(firstKey(daily))
        }
        setPlanType(next)
        setTemplateChoice(null)
    }

    const copyDay = () => {
        if (copyTargets.length === 0) {
            return
        }
        const source = days[day] ?? []
        setDays((current) => {
            const next = { ...current }
            for (const target of copyTargets.filter((target) => target !== day)) {
                next[target] = cloneMeals(source)
            }
            return next
        })
        setCopyTargets([])
        setShowCopy(false)
    }

    // Kaydetme hatası hem kartın altında hem bildirimde (sayfa uzun olabilir)
    const failSave = (message: string) => {
        setSaveError(message)
        toast(message, 'error')
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
            failSave(t('diet.editor.titleRequired'))
            return
        }
        if (request.meals.length === 0) {
            failSave(t('diet.editor.noMeals'))
            return
        }
        // Adı ya da maddesi boş öğün: o gün açılır ve o öğün seçilir
        for (const dayIndex of dayIndexes) {
            const incomplete = (days[dayIndex] ?? []).find((meal) => meal.name.trim() === '' || meal.items.trim() === '')
            if (incomplete) {
                failSave(
                    planType === 'WEEKLY'
                        ? t('diet.editor.incompleteMealOnDay', { day: t(`diet.days.long.${dayIndex}`) })
                        : t('diet.editor.incompleteMeal'),
                )
                if (planType === 'WEEKLY') {
                    setDay(dayIndex)
                }
                setSelectedKey(incomplete.key)
                return
            }
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
            failSave(toErrorMessage(error, t, 'diet.editor.saveError'))
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

    const itemPicker = (hideTitle: boolean) => (
        <ItemPicker
            hideTitle={hideTitle}
            library={library}
            loadError={libraryError}
            targetName={selectedMeal ? selectedMeal.name.trim() : null}
            optionMode={optionMode}
            onOptionModeChange={setOptionMode}
            onAddItem={addQuickItem}
            onEdit={() => {
                // Telefonda madde paneli önce kapanır: iki pencere üst üste açılıp sayfa kaydırması kilitli kalmasın
                setPickerOpen(false)
                setSheetOpen(true)
            }}
        />
    )

    const dayCounts = Object.fromEntries(WEEKDAYS.map((weekday) => [weekday, (days[weekday] ?? []).length]))

    return (
        <>
            <PageHero wide>
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

            <PageBody wide>
                {loading && <LoadingCards count={3} label={t('dashboard.loading')} />}
                {loadError !== null && (
                    <p className="rounded-3xl bg-card p-5 text-danger shadow-soft">
                        {toErrorMessage(loadError, t, 'diet.loadError')}
                    </p>
                )}

                {!loading && loadError === null && (
                    <div className="space-y-4 pb-24 md:pb-6">
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

                        {/* Program bilgileri: tür, başlık, tarih, kaydet; altında notlar */}
                        <section className="space-y-3 rounded-3xl bg-card p-5 shadow-soft">
                            <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)_11rem_auto] md:items-end">
                                <div className="flex gap-2">
                                    {(['DAILY', 'WEEKLY'] as PlanType[]).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => void changeType(type)}
                                            className={`flex-1 ${chipClass(planType === type)} py-2.5`}
                                        >
                                            {t(`diet.type.${type}`)}
                                        </button>
                                    ))}
                                </div>
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
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`${primaryButtonClass} md:w-auto md:px-8`}
                                >
                                    {saving ? t('diet.editor.saving') : t('diet.editor.save')}
                                </button>
                            </div>
                            {saveError && <p className={errorTextClass}>{saveError}</p>}

                            {/* Genel not: dolu ise açık başlar */}
                            <details
                                open={notesOpen}
                                onToggle={(e) => setNotesOpen(e.currentTarget.open)}
                                className="group rounded-2xl bg-cream px-4 py-3"
                            >
                                <summary className="cursor-pointer text-sm font-semibold text-ink">{t('diet.editor.notes')}</summary>
                                <textarea
                                    id="plan-notes"
                                    aria-label={t('diet.editor.notes')}
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={t('diet.editor.notesPlaceholder')}
                                    className={`${inputClass} mt-2 bg-card`}
                                />
                            </details>
                        </section>

                        {/* Haftalık programda gün seçimi (altında öğün sayısı) ve kopyalama */}
                        {planType === 'WEEKLY' && (
                            <section className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="min-w-0 flex-1">
                                        <DayTabs selected={day} onSelect={selectDay} counts={dayCounts} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowCopy((value) => !value)}
                                        className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-brand hover:bg-card"
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

                        {/* Büyük ekran: günün öğünleri · açık öğün · maddeler. Dik tablet: açık öğün · maddeler (öğünler şeritte). */}
                        <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_260px] lg:grid-cols-[220px_minmax(0,1fr)_280px]">
                            <aside className="hidden rounded-3xl bg-card p-4 shadow-soft lg:sticky lg:top-4 lg:block lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
                                <MealList
                                    meals={meals}
                                    selectedKey={selectedKey}
                                    library={library}
                                    onSelect={(key) => {
                                        setSelectedKey(key)
                                        setTemplateChoice(null)
                                    }}
                                    onMove={moveMeal}
                                    onAdd={addMeal}
                                />
                            </aside>

                            <div id="acik-ogun" className="min-w-0 scroll-mt-4 space-y-3">
                                <div className="lg:hidden">
                                    <MealStrip
                                        meals={meals}
                                        selectedKey={selectedKey}
                                        library={library}
                                        onSelect={(key) => {
                                            setSelectedKey(key)
                                            setTemplateChoice(null)
                                        }}
                                        onAdd={addMeal}
                                    />
                                </div>
                                <MealEditor
                                    meal={selectedMeal}
                                    isWeekly={planType === 'WEEKLY'}
                                    isFirst={selectedIndex <= 0}
                                    isLast={selectedIndex === meals.length - 1}
                                    flash={selectedMeal !== null && flashKey === selectedMeal.key}
                                    templateBusy={templateSaving}
                                    libraryReady={library !== null}
                                    notice={selectedMeal && cardNotice?.key === selectedMeal.key ? cardNotice : null}
                                    templateMatch={
                                        selectedMeal && templateChoice?.mealKey === selectedMeal.key ? templateChoice.match : null
                                    }
                                    onChange={(patch) => selectedMeal && updateMeal(selectedMeal.key, patch)}
                                    onMove={(direction) => selectedMeal && moveMeal(selectedMeal.key, direction)}
                                    onRemove={() => selectedMeal && void removeMeal(selectedMeal.key)}
                                    onSaveTemplate={() => selectedMeal && saveAsTemplate(selectedMeal)}
                                    onAddToAllDays={() => selectedMeal && addToAllDays(selectedMeal)}
                                    onStoreTemplate={(replaceId) => selectedMeal && void storeTemplate(selectedMeal, replaceId)}
                                    onCancelTemplate={() => setTemplateChoice(null)}
                                />
                            </div>

                            <aside className="hidden rounded-3xl bg-card p-4 shadow-soft md:sticky md:top-4 md:block md:max-h-[calc(100vh-2rem)] md:overflow-y-auto">
                                {itemPicker(false)}
                            </aside>
                        </div>
                    </div>
                )}
            </PageBody>

            {/* Telefon: alttaki "+ Madde" düğmesi ve madde paneli (eklendikçe kapanmaz, "Bitti" ile kapanır) */}
            {!loading &&
                loadError === null &&
                createPortal(
                    <button
                        type="button"
                        onClick={() => {
                            // Açık öğün panelin üstünde görünsün: eklenen maddeler arkada izlenebilir
                            document.getElementById('acik-ogun')?.scrollIntoView({ block: 'start' })
                            setPickerOpen(true)
                        }}
                        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 rounded-full bg-brand px-5 py-3 font-bold text-cream shadow-float transition hover:bg-brand-dark active:scale-[0.97] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] md:hidden"
                    >
                        <ListPlus className="h-5 w-5" />
                        {t('diet.editor.addItemShort')}
                    </button>,
                    document.body,
                )}
            <BottomSheet
                open={pickerOpen}
                title={selectedMeal ? t('diet.editor.itemsFor', { name: selectedMeal.name.trim() || t('diet.editor.unnamedMeal') }) : t('diet.editor.tabItems')}
                onClose={closePicker}
            >
                {itemPicker(true)}
            </BottomSheet>

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
