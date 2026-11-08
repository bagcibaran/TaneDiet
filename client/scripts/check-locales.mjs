// Dil dosyalarının (tr, en, de) aynı anahtarlara sahip olduğunu kontrol eder. Eksik ya da fazla anahtarı listeler.
// Kullanım: npm run check:locales  (fark varsa hata koduyla biter)
import { existsSync, readFileSync } from 'node:fs'

const LANGUAGES = ['tr', 'en', 'de']
const dir = new URL('../src/i18n/locales/', import.meta.url)

function keys(object, prefix = '') {
    return Object.entries(object).flatMap(([key, value]) =>
        value !== null && typeof value === 'object' ? keys(value, `${prefix}${key}.`) : [`${prefix}${key}`],
    )
}

const sets = {}
let ok = true
for (const lang of LANGUAGES) {
    const file = new URL(`${lang}.json`, dir)
    if (!existsSync(file)) {
        console.error(`${lang}.json bulunamadı`)
        ok = false
        continue
    }
    sets[lang] = new Set(keys(JSON.parse(readFileSync(file, 'utf8'))))
}

const reference = sets.tr
if (reference) {
    for (const lang of LANGUAGES.filter((code) => code !== 'tr' && sets[code])) {
        const missing = [...reference].filter((key) => !sets[lang].has(key))
        const extra = [...sets[lang]].filter((key) => !reference.has(key))
        for (const key of missing) console.error(`${lang}.json eksik: ${key}`)
        for (const key of extra) console.error(`${lang}.json fazla: ${key}`)
        if (missing.length || extra.length) ok = false
    }
}

if (!ok) {
    process.exit(1)
}
console.log(`Dil dosyaları uyumlu (${reference.size} anahtar)`)
