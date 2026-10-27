import { useTranslation } from 'react-i18next'

import { formatKg } from '../utils/format'
import type { WeightSummary } from '../types/weight'

type WeightSummaryCardsProps = {
    summary: WeightSummary
}

// Son 7 gün ve son 30 gün değişimi. "Başlangıçtan beri" sayfa başlığında gösteriliyor.
function WeightSummaryCards({ summary }: WeightSummaryCardsProps) {
    const { t, i18n } = useTranslation()

    // Kilo verildiyse yeşil, alındıysa kırmızı, değişim yoksa veya bilinmiyorsa gri
    function changeColor(value: number | null): string {
        if (value === null || value === 0) {
            return 'text-muted'
        }
        return value < 0 ? 'text-brand' : 'text-red-700'
    }

    const cards = [
        { label: t('weights.last7Days'), value: summary.changeLast7DaysKg },
        { label: t('weights.last30Days'), value: summary.changeLast30DaysKg },
    ]

    return (
        <div className="mt-4 grid grid-cols-2 gap-3">
            {cards.map((card) => (
                <div key={card.label} className="rounded-xl bg-cream p-4 text-center">
                    <p className={`text-2xl font-extrabold tracking-tight ${changeColor(card.value)}`}>
                        {card.value === null ? '—' : formatKg(card.value, i18n.language, true)}
                    </p>
                    <p className="mt-1 text-xs text-muted">{card.label}</p>
                </div>
            ))}
        </div>
    )
}

export default WeightSummaryCards