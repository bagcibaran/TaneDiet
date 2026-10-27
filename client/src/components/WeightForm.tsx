import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { toErrorMessage } from '../services/errorMessage'
import type { CreateWeightEntryRequest } from '../types/weight'

type WeightFormProps = {
    onSubmit: (request: CreateWeightEntryRequest) => Promise<void>
}

// Bugünün tarihi "2026-10-23" biçiminde (tarih kutusu bu biçimi ister)
function today(): string {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
}

function WeightForm({ onSubmit }: WeightFormProps) {
    const { t } = useTranslation()

    const [weightKg, setWeightKg] = useState('')
    const [measuredOn, setMeasuredOn] = useState(today())
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setSaving(true)

        try {
            await onSubmit({
                // Türkçede "72,4" yazılır; backend "72.4" bekler
                weightKg: Number(weightKg.replace(',', '.')),
                measuredOn,
            })
            setWeightKg('')
        } catch (error) {
            setError(toErrorMessage(error, t, 'weights.addError'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
            <div>
                <label htmlFor="weight-kg" className="mb-1 block text-sm font-medium text-slate-700">
                    {t('weights.weightLabel')}
                </label>
                <input
                    id="weight-kg"
                    type="text"
                    inputMode="decimal"
                    value={weightKg}
                    onChange={(event) => setWeightKg(event.target.value)}
                    required
                    className="w-32 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
            </div>

            <div>
                <label htmlFor="measured-on" className="mb-1 block text-sm font-medium text-slate-700">
                    {t('weights.dateLabel')}
                </label>
                <input
                    id="measured-on"
                    type="date"
                    value={measuredOn}
                    max={today()}
                    onChange={(event) => setMeasuredOn(event.target.value)}
                    required
                    className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
            </div>

            <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {saving ? t('weights.adding') : t('weights.add')}
            </button>

            {error && <p className="w-full text-sm text-red-600">{error}</p>}
        </form>
    )
}

export default WeightForm