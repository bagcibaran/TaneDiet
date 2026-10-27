// 74.6 → "74,6 kg" ; signed=true ise -3.8 → "-3,8 kg", 1.2 → "+1,2 kg"
export function formatKg(value: number, language: string, signed = false): string {
    const number = value.toLocaleString(language, {
        signDisplay: signed ? 'exceptZero' : 'auto',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
    })
    return `${number} kg`
}