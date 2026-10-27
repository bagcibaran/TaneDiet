import { useTranslation } from 'react-i18next'

import type { WeightSummary } from '../types/weight'

type WeightSummaryCardsProps = {
    summary: WeightSummary
}

function WeightSummaryCards({ summary }: WeightSummaryCardsProps) {
    const { t, i18n } = useTranslation()

    // -0.9 → "-0,9 kg", 3.4 → "+3,4 kg" (işaret her zaman görünsün)
    function formatChange(value: number | null): string {
        if (value === null) {
            return '—'
        }
        return `${value.toLocaleString(i18n.language, {
            signDisplay: 'exceptZero',
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
        })} kg`
    }

    // Kilo verildiyse yeşil, alındıysa kırmızı, değişim yoksa veya bilinmiyorsa gri
    function changeColor(value: number | null): string {
        if (value === null || value === 0) {
            return 'text-slate-500'
        }
        return value < 0 ? 'text-green-600' : 'text-red-600'
    }

    const cards = [
        { label: t('weights.sinceStart'), value: summary.changeSinceStartKg },
        { label: t('weights.last7Days'), value: summary.changeLast7DaysKg },
        { label: t('weights.last30Days'), value: summary.changeLast30DaysKg },
    ]

    return (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {cards.map((card) => (
                <div key={card.label} className="rounded-lg border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">{card.label}</p>
                    <p className={`mt-1 text-2xl font-semibold ${changeColor(card.value)}`}>
                        {formatChange(card.value)}
                    </p>
                </div>
            ))}
        </div>
    )
}

export default WeightSummaryCards