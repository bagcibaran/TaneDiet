// 74.6 → "74,6 kg" ; signed=true ise -3.8 → "-3,8 kg", 1.2 → "+1,2 kg"
export function formatKg(value: number, language: string, signed = false): string {
    const number = value.toLocaleString(language, {
        signDisplay: signed ? 'exceptZero' : 'auto',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
    })
    return `${number} kg`
}

// Backend tarih-saati ("2026-10-30T12:00:00.123456", Türkiye saati) → "30 Eki 2026 12:00".
// Uzun kesirli saniyeyi her tarayıcı okumadığı için saniyeye kadar kesilir.
export function formatDateTime(value: string, language: string): string {
    return new Date(value.slice(0, 19)).toLocaleString(language, { dateStyle: 'medium', timeStyle: 'short' })
}