import { useTranslation } from 'react-i18next'
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import type { WeightPoint } from '../types/weight'

type WeightChartProps = {
    points: WeightPoint[]
}

const LINE_COLOR = '#2563eb' // uygulamadaki mavi (blue-600)
const GRID_COLOR = '#e2e8f0' // çok açık gri, arka planda kalsın
const AXIS_TEXT_COLOR = '#64748b' // gri yazı

function WeightChart({ points }: WeightChartProps) {
    const { t, i18n } = useTranslation()

    // Tarihi sayıya (milisaniye) çeviriyoruz ki yatay eksen gerçek zaman aralığını göstersin:
    // 3 gün arayla girilen kayıtlar 3 birim, 7 gün arayla girilenler 7 birim uzakta durur.
    const data = points.map((point) => ({
        time: new Date(`${point.date}T00:00:00`).getTime(),
        weightKg: point.weightKg,
    }))

    // 1700000000000 → "27 Eki"
    const formatShortDate = (time: number) =>
        new Date(time).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })

    return (
        <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke={GRID_COLOR} vertical={false} />

                    <XAxis
                        dataKey="time"
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={formatShortDate}
                        tick={{ fill: AXIS_TEXT_COLOR, fontSize: 12 }}
                        stroke={GRID_COLOR}
                        tickLine={false}
                    />

                    <YAxis
                        domain={[
                            (min: number) => Math.floor(min - 1),
                            (max: number) => Math.ceil(max + 1),
                        ]}
                        allowDecimals={false}
                        tickFormatter={(value: number) => value.toLocaleString(i18n.language)}
                        tick={{ fill: AXIS_TEXT_COLOR, fontSize: 12 }}
                        stroke={GRID_COLOR}
                        tickLine={false}
                        width={40}
                    />

                    <Tooltip
                        cursor={{ stroke: AXIS_TEXT_COLOR, strokeWidth: 1 }}
                        labelFormatter={(time) => new Date(Number(time)).toLocaleDateString(i18n.language)}
                        formatter={(value) => [`${Number(value).toLocaleString(i18n.language)} kg`, t('weights.weightLabel')]}
                    />

                    <Line
                        type="linear"
                        dataKey="weightKg"
                        stroke={LINE_COLOR}
                        strokeWidth={2}
                        dot={{ r: 4, fill: LINE_COLOR, stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: LINE_COLOR, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default WeightChart