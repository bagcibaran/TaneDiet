import { useTranslation } from 'react-i18next'

import { WEEKDAYS, todayIndex } from '../../diet/dietUtils'

type DayTabsProps = {
    selected: number
    onSelect: (dayIndex: number) => void
    // Bugünü küçük bir noktayla işaretle (danışan ekranı)
    markToday?: boolean
    // Verilirse her günün altında küçük öğün sayısı (program editörü)
    counts?: Record<number, number>
}

// Pzt Sal Çar … Paz düğmeleri (haftalık program)
function DayTabs({ selected, onSelect, markToday = false, counts }: DayTabsProps) {
    const { t } = useTranslation()
    const today = todayIndex()

    return (
        <div className="flex gap-1 overflow-x-auto pb-1" role="tablist">
            {WEEKDAYS.map((day) => (
                <button
                    key={day}
                    type="button"
                    role="tab"
                    aria-selected={selected === day}
                    onClick={() => onSelect(day)}
                    className={`relative min-w-11 flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
                        selected === day ? 'bg-brand text-cream' : 'bg-card text-muted hover:text-brand'
                    }`}
                >
                    {t(`diet.days.short.${day}`)}
                    {counts && (
                        <span className={`block text-[0.65rem] font-medium ${selected === day ? 'text-mint' : 'text-muted'}`}>
                            {counts[day] ?? 0}
                        </span>
                    )}
                    {markToday && day === today && (
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-honey" />
                    )}
                </button>
            ))}
        </div>
    )
}

export default DayTabs
