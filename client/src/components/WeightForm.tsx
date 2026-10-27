import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { toErrorMessage } from '../services/errorMessage'
import { errorTextClass, inputClass, labelClass, primaryButtonClass } from './ui'
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
        // Telefonda: kilo ve tarih yan yana, buton altta tam genişlik.
        // Bilgisayarda: üçü tek satırda.
        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-2 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
                <label htmlFor="weight-kg" className={labelClass}>
                    {t('weights.weightLabel')}
                </label>
                <input
                    id="weight-kg"
                    type="text"
                    inputMode="decimal"
                    placeholder="72,4"
                    value={weightKg}
                    onChange={(event) => setWeightKg(event.target.value)}
                    required
                    className={inputClass}
                />
            </div>

            <div>
                <label htmlFor="measured-on" className={labelClass}>
                    {t('weights.dateLabel')}
                </label>
                <input
                    id="measured-on"
                    type="date"
                    value={measuredOn}
                    max={today()}
                    onChange={(event) => setMeasuredOn(event.target.value)}
                    required
                    className={inputClass}
                />
            </div>

            <button
                type="submit"
                disabled={saving}
                className={`col-span-2 sm:col-span-1 sm:w-auto sm:px-6 ${primaryButtonClass}`}
            >
                {saving ? t('weights.adding') : t('weights.add')}
            </button>

            {error && <p className={`col-span-2 sm:col-span-3 ${errorTextClass}`}>{error}</p>}
        </form>
    )
}

export default WeightForm