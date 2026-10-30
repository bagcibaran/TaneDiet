import type { TFunction } from 'i18next'

import { INTAKE_STEPS, type IntakeFieldConfig, type IntakeFieldName } from './intakeSteps'
import type { IntakeForm } from '../types/intake'

const FIELDS_BY_NAME = new Map<IntakeFieldName, IntakeFieldConfig>(
    INTAKE_STEPS.flatMap((step) => step.fields.map((field) => [field.name, field] as const)),
)

// Bir ön görüşme cevabını ekranda okunacak metne çevirir; boş cevaplar "Yok".
// Danışan sayfasındaki özet ve dışa aktarma sayfası ortak kullanır.
export function formatIntakeAnswer(form: IntakeForm, name: IntakeFieldName, t: TFunction, language: string): string {
    const field = FIELDS_BY_NAME.get(name)
    const value = form[name]
    if (value === null || value === undefined || value === '') {
        return t('intake.summary.none')
    }
    if (typeof value === 'boolean') {
        return value ? t('intake.yes') : t('intake.no')
    }
    if (field?.kind === 'choice') {
        const label = t(`intake.options.${field.optionSet}.${value}`)
        return name === 'goal' && value === 'OTHER' && form.goalOther ? `${label}: ${form.goalOther}` : label
    }
    if (field?.kind === 'date') {
        return new Date(`${value}T00:00:00`).toLocaleDateString(language)
    }
    return typeof value === 'number' ? value.toLocaleString(language) : value
}
