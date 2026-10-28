import { useTranslation } from 'react-i18next'

import { itemLines, splitAlternatives } from '../../diet/dietUtils'
import type { DietMeal } from '../../types/diet'

type DayMenuProps = {
    meals: DietMeal[]
}

// Bir günün menüsü: diyetisyenin listesindeki gibi yeşil başlıklı öğün kartları.
// Seçenekler ("a / b / c") ayrı satırlarda "veya" ile gösterilir.
function DayMenu({ meals }: DayMenuProps) {
    const { t } = useTranslation()

    if (meals.length === 0) {
        return <p className="rounded-xl bg-card p-4 text-muted">{t('diet.emptyDay')}</p>
    }

    return (
        <div className="space-y-3">
            {meals.map((meal) => (
                <article key={`${meal.dayIndex}-${meal.position}`} className="overflow-hidden rounded-xl border border-line bg-card">
                    <header className="bg-mint/40 px-4 py-2 text-sm font-bold uppercase tracking-wider text-brand">
                        {meal.name}
                        {meal.time && <span className="ml-1 font-semibold">({meal.time})</span>}
                    </header>
                    <ul className="space-y-2 px-4 py-3 text-ink">
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
