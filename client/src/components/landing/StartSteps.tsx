import { useTranslation } from 'react-i18next'

import { TONE_CLASSES, type Tone } from '../../landing/content'

const STEPS: { key: string; tone: Tone }[] = [
    { key: 'step1', tone: 'sage' },
    { key: 'step2', tone: 'peach' },
    { key: 'step3', tone: 'lilac' },
    { key: 'step4', tone: 'sky' },
]

// "Nasıl başlarım?": WhatsApp → ödeme → davet linki → menün telefonunda
function StartSteps() {
    const { t } = useTranslation()

    return (
        <ol className="grid gap-2 sm:grid-cols-2">
            {STEPS.map((step, index) => (
                <li key={step.key} className="flex items-center gap-3 rounded-3xl bg-card p-3.5 shadow-soft transition hover:-translate-y-0.5">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-extrabold ${TONE_CLASSES[step.tone]}`}>
                        {index + 1}
                    </span>
                    <span>
                        <span className="block font-bold text-ink">{t(`landing.${step.key}Title`)}</span>
                        <span className="block text-sm text-muted">{t(`landing.${step.key}Text`)}</span>
                    </span>
                </li>
            ))}
        </ol>
    )
}

export default StartSteps
