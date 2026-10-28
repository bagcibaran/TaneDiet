import { useTranslation } from 'react-i18next'

import { MEAL_DOT_COLORS, itemLines, splitAlternatives } from '../../diet/dietUtils'
import type { DietMeal } from '../../types/diet'

type DayMenuProps = {
    meals: DietMeal[]
}

// Bir günün menüsü: her öğün bir kart; başlıkta renkli nokta, öğün adı ve saat.
// Seçenekler ("a / b / c") ayrı satırlarda "veya" ile gösterilir.
function DayMenu({ meals }: DayMenuProps) {
    const { t } = useTranslation()

    if (meals.length === 0) {
        return <p className="rounded-3xl bg-card p-5 text-muted shadow-soft">{t('diet.emptyDay')}</p>
    }

    return (
        <div className="space-y-3">
            {meals.map((meal, mealIndex) => (
                <article
                    key={`${meal.dayIndex}-${meal.position}`}
                    className="animate-rise rounded-3xl bg-card shadow-soft"
                    style={{ animationDelay: `${mealIndex * 0.06}s` }}
                >
                    <header className="flex items-center gap-3 border-b border-dashed border-line px-5 py-3">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${MEAL_DOT_COLORS[mealIndex % MEAL_DOT_COLORS.length]}`} />
                        <span className="font-bold text-ink">{meal.name}</span>
                        {meal.time && (
                            <span className="ml-auto rounded-full bg-sage px-2.5 py-0.5 text-xs font-semibold text-brand">
                                {meal.time}
                            </span>
                        )}
                    </header>
                    <ul className="space-y-2 px-5 py-3 text-ink">
                        {itemLines(meal.items).map((line, index) => {
                            const options = splitAlternatives(line)
                            return (
                                <li key={index} className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                    <span className="min-w-0">
                                        {options.map((option, optionIndex) => (
                                            <span key={optionIndex} className="block">
                                                {optionIndex > 0 && (
                                                    <span className="mr-1 text-xs font-semibold uppercase text-muted">
                                                        {t('diet.or')}
                                                    </span>
                                                )}
                                                {option}
                                            </span>
                                        ))}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                </article>
            ))}
        </div>
    )
}

export default DayMenu
