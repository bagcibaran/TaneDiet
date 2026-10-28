import { useTranslation } from 'react-i18next'

import { WEEKDAYS, todayIndex } from '../../diet/dietUtils'

type DayTabsProps = {
    selected: number
    onSelect: (dayIndex: number) => void
    // Bugünü küçük bir noktayla işaretle (danışan ekranı)
    markToday?: boolean
}

// Pzt Sal Çar … Paz düğmeleri (haftalık program)
function DayTabs({ selected, onSelect, markToday = false }: DayTabsProps) {
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
                    {markToday && day === today && (
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                </button>
            ))}
        </div>
    )
}

export default DayTabs
