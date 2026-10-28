import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

import { inputClass, labelClass } from '../ui'
import type { IntakeFieldConfig } from '../../intake/intakeSteps'

type IntakeFieldProps = {
    field: IntakeFieldConfig
    value: string | boolean | null | undefined
    onChange: (value: string | boolean) => void
    error?: string | null
}

const chipClass = (selected: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${
        selected ? 'border-brand bg-brand text-cream' : 'border-line bg-cream text-muted hover:border-brand hover:text-brand'
    }`

// Ön görüşme formundaki tek bir soruyu, türüne göre çizer
function IntakeField({ field, value, onChange, error }: IntakeFieldProps) {
    const { t } = useTranslation()
    const id = `intake-${field.name}`
    const label = t(`intake.fields.${field.name}`)
    const text = typeof value === 'string' ? value : ''

    const labelRow = (
        <label htmlFor={id} className={labelClass}>
            {label}
            {!field.required && field.kind !== 'check' && (
                <span className="ml-1 font-normal text-muted">({t('intake.optional')})</span>
            )}
        </label>
    )

    let control
    switch (field.kind) {
        case 'longText':
            control = (
                <textarea id={id} rows={3} value={text} onChange={(event) => onChange(event.target.value)} className={inputClass} />
            )
            break
        case 'date':
            control = (
                <input id={id} type="date" value={text} onChange={(event) => onChange(event.target.value)} className={inputClass} />
            )
            break
        case 'number':
        case 'decimal':
            control = (
                <input
                    id={id}
                    type="text"
                    inputMode={field.kind === 'number' ? 'numeric' : 'decimal'}
                    value={text}
                    onChange={(event) => onChange(event.target.value)}
                    className={inputClass}
                />
            )
            break
        case 'choice':
            control = (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
                    {field.options?.map((option) => (
                        <button
                            key={option}
                            type="button"
                            role="radio"
                            aria-checked={value === option}
                            onClick={() => onChange(option)}
                            className={chipClass(value === option)}
                        >
                            {t(`intake.options.${field.optionSet}.${option}`)}
                        </button>
                    ))}
                </div>
            )
            break
        case 'yesNo':
            control = (
                <div className="flex gap-2" role="radiogroup" aria-label={label}>
                    {[true, false].map((option) => (
                        <button
                            key={String(option)}
                            type="button"
                            role="radio"
                            aria-checked={value === option}
                            onClick={() => onChange(option)}
                            className={chipClass(value === option)}
                        >
                            {option ? t('intake.yes') : t('intake.no')}
                        </button>
                    ))}
                </div>
            )
            break
        case 'check':
            // Birden fazla seçilebilen seçenek (spor türleri): kendi etiketini taşır
            return (
                <div>
                    {field.heading && <p className={labelClass}>{t(`intake.fields.${field.heading}`)}</p>}
                    <button
                        type="button"
                        role="checkbox"
                        aria-checked={value === true}
                        onClick={() => onChange(value !== true)}
                        className={`${chipClass(value === true)} inline-flex items-center gap-2`}
                    >
                        {value === true && <Check className="h-4 w-4" />}
                        {label}
                    </button>
                </div>
            )
        default:
            control = (
                <input id={id} type="text" value={text} onChange={(event) => onChange(event.target.value)} className={inputClass} />
            )
    }

    return (
        <div>
            {labelRow}
            {control}
            {error && (
                <p className="mt-1 text-sm text-red-700">
                    {t(error, { min: field.min, max: field.max })}
                </p>
            )}
        </div>
    )
}

export default IntakeField
