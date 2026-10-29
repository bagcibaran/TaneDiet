import type { IntakeFormRequest } from '../types/intake'

// Ön görüşme formunun bütün soruları burada. Yeni bir soru = bu listeye bir satır
// (+ backend'de alan + çeviriler). Ekranı IntakeField bileşeni bu listeden çiziyor.

export type FieldKind = 'text' | 'longText' | 'date' | 'number' | 'decimal' | 'choice' | 'yesNo' | 'check'

export type IntakeFieldName = Exclude<keyof IntakeFormRequest, 'consent'>

export type IntakeFieldConfig = {
    name: IntakeFieldName
    kind: FieldKind
    required?: boolean
    // choice: seçenek değerleri ve çeviri grubu (intake.options.<optionSet>.<DEĞER>)
    options?: readonly string[]
    optionSet?: string
    // number / decimal: izin verilen aralık
    min?: number
    max?: number
    // Alanın üstüne bir grup başlığı (örneğin birden fazla seçilebilen spor türleri)
    heading?: string
    // Yazı alanları: en fazla karakter (verilmezse text 255, longText 2000; backend ile aynı)
    maxLength?: number
    // Yalnızca bu koşul doğruysa sorulur (ör. "Diğer" seçilince açıklama). Gizli alan gönderilmez.
    showIf?: (answers: IntakeAnswers) => boolean
}

export type IntakeStepConfig = {
    key: string
    fields: IntakeFieldConfig[]
    // Adımın başında gösterilecek bilgi notu
    note?: 'bloodTest'
}

export const INTAKE_STEPS: IntakeStepConfig[] = [
    {
        key: 'personal',
        fields: [
            { name: 'fullName', kind: 'text', required: true, maxLength: 100 },
            { name: 'birthDate', kind: 'date', required: true },
            { name: 'gender', kind: 'choice', required: true, optionSet: 'Gender', options: ['FEMALE', 'MALE'] },
            { name: 'heightCm', kind: 'number', required: true, min: 100, max: 250 },
            { name: 'weightKg', kind: 'decimal', required: true, min: 20, max: 400 },
            { name: 'occupation', kind: 'text', required: true, maxLength: 100 },
        ],
    },
    {
        key: 'health',
        note: 'bloodTest',
        fields: [
            { name: 'chronicDiseases', kind: 'longText' },
            { name: 'surgeries', kind: 'longText' },
            { name: 'medications', kind: 'longText' },
            { name: 'allergies', kind: 'longText' },
        ],
    },
    {
        key: 'eating',
        fields: [
            { name: 'mainMeals', kind: 'choice', required: true, optionSet: 'MainMeals', options: ['TWO', 'THREE', 'FOUR_PLUS'] },
            { name: 'eatsBreakfast', kind: 'yesNo', required: true },
            {
                name: 'waterIntake', kind: 'choice', required: true, optionSet: 'WaterIntake',
                options: ['HALF_LITER', 'ONE_LITER', 'ONE_AND_HALF_LITER', 'TWO_LITERS_PLUS'],
            },
            { name: 'teaCoffee', kind: 'choice', required: true, optionSet: 'TeaCoffee', options: ['NONE', 'TWO_CUPS', 'THREE_CUPS_PLUS'] },
            { name: 'drinksSoda', kind: 'yesNo', required: true },
            { name: 'dislikedFoods', kind: 'longText' },
            { name: 'snacks', kind: 'longText' },
            { name: 'eatingOut', kind: 'longText' },
        ],
    },
    {
        key: 'goals',
        fields: [
            {
                name: 'goal', kind: 'choice', required: true, optionSet: 'Goal',
                options: ['LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN_WEIGHT', 'HEALTHY_HABITS', 'OTHER'],
            },
            { name: 'goalOther', kind: 'text', showIf: (answers) => answers.goal === 'OTHER' },
            { name: 'previousDiets', kind: 'longText' },
            { name: 'specialDiet', kind: 'longText' },
            {
                name: 'programStyle', kind: 'choice', required: true, optionSet: 'ProgramStyle',
                options: ['STRICT', 'FLEXIBLE', 'CONSCIOUS_CHOICES'],
            },
        ],
    },
    {
        key: 'lifestyle',
        fields: [
            {
                name: 'sleepHours', kind: 'choice', required: true, optionSet: 'SleepHours',
                options: ['UNDER_4', 'FROM_4_TO_6', 'FROM_6_TO_8', 'OVER_8'],
            },
            {
                name: 'energyLevel', kind: 'choice', required: true, optionSet: 'EnergyLevel',
                options: ['ENERGETIC', 'MODERATELY_TIRED', 'ALWAYS_TIRED'],
            },
            { name: 'smokes', kind: 'yesNo', required: true },
            { name: 'drinksAlcohol', kind: 'yesNo', required: true },
            { name: 'alcoholFrequency', kind: 'text', showIf: (answers) => answers.drinksAlcohol === true },
        ],
    },
    {
        key: 'sport',
        fields: [
            {
                name: 'exerciseDays', kind: 'choice', required: true, optionSet: 'ExerciseDays',
                options: ['NONE', 'ONE_TO_TWO', 'THREE_TO_FOUR', 'FIVE_PLUS'],
            },
            { name: 'sportCardio', kind: 'check', heading: 'sportTypes' },
            { name: 'sportWeights', kind: 'check' },
            { name: 'sportPilatesYoga', kind: 'check' },
            { name: 'sportOther', kind: 'text' },
            { name: 'tracksSteps', kind: 'yesNo', required: true },
            { name: 'averageSteps', kind: 'number', min: 0, max: 100000, showIf: (answers) => answers.tracksSteps === true },
        ],
    },
    {
        key: 'gut',
        fields: [
            { name: 'digestiveProblems', kind: 'longText' },
            { name: 'lactoseGlutenSymptoms', kind: 'longText' },
        ],
    },
]

// Formda tutulan cevaplar: yazılar ve sayılar yazıldığı gibi (string), evet/hayır boolean
export type IntakeAnswers = Partial<Record<IntakeFieldName, string | boolean | null>>

// Doğum tarihi için en eski kabul edilen gün
export const EARLIEST_DATE = '1900-01-01'

// Soru şu cevaplara göre gösteriliyor mu?
export function isVisible(field: IntakeFieldConfig, answers: IntakeAnswers): boolean {
    return field.showIf ? field.showIf(answers) : true
}

// Yazı alanının en fazla karakter sayısı (backend'deki @Size ile aynı)
export function maxLengthOf(field: IntakeFieldConfig): number | undefined {
    if (field.maxLength !== undefined) {
        return field.maxLength
    }
    if (field.kind === 'longText') {
        return 2000
    }
    return field.kind === 'text' ? 255 : undefined
}

// Bugünün yerel tarihi "YYYY-MM-DD" (toISOString UTC verir, gece yarısına yakın bir gün kayabilir)
function localToday(): string {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
}

// Bir alanın hata anahtarını döndürür (yoksa null). Backend de aynı kuralları uygular.
export function validateField(field: IntakeFieldConfig, value: string | boolean | null | undefined): string | null {
    if (field.kind === 'check') {
        return null
    }
    if (field.kind === 'yesNo') {
        return field.required && typeof value !== 'boolean' ? 'intake.errors.required' : null
    }

    const text = typeof value === 'string' ? value.trim() : ''
    if (text === '') {
        return field.required ? 'intake.errors.required' : null
    }

    const maxLength = maxLengthOf(field)
    if (maxLength !== undefined && text.length > maxLength) {
        return 'intake.errors.tooLong'
    }

    if (field.kind === 'number' || field.kind === 'decimal') {
        const number = Number(text.replace(',', '.'))
        if (!Number.isFinite(number) || (field.kind === 'number' && !Number.isInteger(number))) {
            return 'intake.errors.number'
        }
        if ((field.min !== undefined && number < field.min) || (field.max !== undefined && number > field.max)) {
            return 'intake.errors.range'
        }
        // Kilo veritabanında 2 ondalık basamakla tutulur (ör. 72,45)
        const fraction = text.replace(',', '.').split('.')[1] ?? ''
        if (field.kind === 'decimal' && fraction.length > 2) {
            return 'intake.errors.decimals'
        }
    }

    if (field.kind === 'date' && text >= localToday()) {
        return 'intake.errors.pastDate'
    }
    if (field.kind === 'date' && text < EARLIEST_DATE) {
        return 'intake.errors.tooOld'
    }

    return null
}

// Formdaki cevaplardan backend'e gidecek isteği oluşturur
export function toRequest(answers: IntakeAnswers): IntakeFormRequest {
    const request: Record<string, unknown> = {}
    for (const step of INTAKE_STEPS) {
        for (const field of step.fields) {
            const value = answers[field.name]
            // Gizli soru (ör. "Diğer" seçilmemişken açıklama): eski cevap kalmış olsa da gönderilmez
            if (!isVisible(field, answers)) {
                request[field.name] = field.kind === 'check' ? false : null
                continue
            }
            if (field.kind === 'check') {
                request[field.name] = value === true
            } else if (field.kind === 'yesNo') {
                request[field.name] = typeof value === 'boolean' ? value : null
            } else {
                const text = typeof value === 'string' ? value.trim() : ''
                if (text === '') {
                    request[field.name] = null
                } else if (field.kind === 'number' || field.kind === 'decimal') {
                    // Türkçede "72,4" yazılır; backend "72.4" bekler
                    request[field.name] = Number(text.replace(',', '.'))
                } else {
                    request[field.name] = text
                }
            }
        }
    }
    return request as IntakeFormRequest
}

// Kayıtlı formdan, formda düzenlenecek cevapları oluşturur
export function fromForm(form: IntakeFormRequest): IntakeAnswers {
    const answers: IntakeAnswers = {}
    for (const step of INTAKE_STEPS) {
        for (const field of step.fields) {
            const value = form[field.name]
            if (typeof value === 'boolean') {
                answers[field.name] = value
            } else if (value === null) {
                answers[field.name] = ''
            } else {
                // Kilo Türkçe yazılır: 72.4 → "72,4"
                answers[field.name] = field.kind === 'decimal' ? String(value).replace('.', ',') : String(value)
            }
        }
    }
    return answers
}
