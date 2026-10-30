// Tanıtım sayfası için gerçek ekran görüntüleri: örnek danışan "Ayşe" (gerçek veri değil), TR ve EN.
// YALNIZCA yerel geliştirme veritabanında çalıştır. Gerekenler:
//   1. Test API'si 8081'de, uygulama 5174'te (API isteklerini 8081'e yollayan geçici bir Vite ayarıyla) açık.
//   2. Chrome hata ayıklama portuyla açık:
//      chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<geçici klasör> about:blank
//   3. Yerel veritabanında demo-diyetisyen@test.local (şifre Demo12345!) DIETITIAN rolüyle var
//      (başlangıç daveti SQL ile eklenip /auth/register ile kayıt, sonra role='DIETITIAN').
// Kullanım: node scripts/showcase-shots.mjs public/showcase
// Bittikten sonra demo-%@test.local kullanıcılarını ve verilerini sil. Almanca eklenince dil listesine 'de' ekle.
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = process.argv[2]
const API = 'http://localhost:8081'
const APP = 'http://localhost:5174'
const PW = 'Demo12345!'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function call(method, path, body, token) {
    const res = await fetch(API + path, {
        method,
        headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: body ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text}`)
    return text ? JSON.parse(text) : null
}
const login = async (email) => (await call('POST', '/auth/login', { email, password: PW })).token

// ---------- Örnek veri ----------
const D = await login('demo-diyetisyen@test.local')
const inv = await call('POST', '/invites', { months: 3 }, D)
await call('POST', '/auth/register', { username: 'Ayşe', email: 'demo-ayse@test.local', password: PW, inviteToken: inv.token })
const C = await login('demo-ayse@test.local')

const weights = [76.8, 76.1, 75.6, 75.0, 74.5, 73.9, 73.4, 73.0, 72.4]
for (let i = 0; i < weights.length; i++) {
    const d = new Date(Date.UTC(2026, 8, 4 + i * 7)).toISOString().slice(0, 10)
    await call('POST', '/weights', { weightKg: weights[i], measuredOn: d }, C)
}

const intake = (lang) => ({
    fullName: 'Ayşe Yılmaz', birthDate: '1991-04-18', gender: 'FEMALE', heightCm: 166, weightKg: 76.8,
    occupation: lang === 'en' ? 'Teacher' : 'Öğretmen', mainMeals: 'THREE', eatsBreakfast: true, waterIntake: 'ONE_LITER',
    teaCoffee: 'TWO_CUPS', drinksSoda: false, goal: 'LOSE_WEIGHT', programStyle: 'FLEXIBLE', sleepHours: 'FROM_6_TO_8',
    energyLevel: 'MODERATELY_TIRED', smokes: false, drinksAlcohol: false, exerciseDays: 'ONE_TO_TWO', sportCardio: true,
    sportWeights: false, sportPilatesYoga: true, tracksSteps: true, averageSteps: 6500, consent: lang === 'tr' ? true : undefined,
})
await call('PUT', '/intake', intake('tr'), C)

const MEALS = {
    tr: [
        ['Kahvaltı', '08:30', '2 haşlanmış yumurta\n30 gr beyaz peynir / 2 YK lor\n5 tane zeytin\nBol yeşillik, domates, salatalık\n1 dilim tam buğday ekmeği'],
        ['Ara öğün', '11:00', '1 porsiyon meyve\n10 adet çiğ badem'],
        ['Öğle', '13:30', 'Izgara tavuk (120 gr) / köfte\nMevsim salata (1 YK zeytinyağı)\n1 kase yoğurt'],
        ['Ara öğün', '16:30', '1 bardak ayran\n2 adet kuru kayısı'],
        ['Akşam', '19:30', 'Zeytinyağlı sebze yemeği\n4 YK bulgur pilavı / 1 dilim ekmek\nCacık'],
    ],
    en: [
        ['Breakfast', '08:30', '2 boiled eggs\n30 g white cheese / 2 tbsp curd\n5 olives\nGreens, tomato, cucumber\n1 slice of wholemeal bread'],
        ['Snack', '11:00', '1 portion of fruit\n10 raw almonds'],
        ['Lunch', '13:30', 'Grilled chicken (120 g) / meatballs\nSeasonal salad (1 tbsp olive oil)\n1 bowl of yogurt'],
        ['Snack', '16:30', '1 glass of ayran\n2 dried apricots'],
        ['Dinner', '19:30', 'Vegetables in olive oil\n4 tbsp bulgur / 1 slice of bread\nTzatziki'],
    ],
}
const plan = (lang) => ({
    planType: 'DAILY',
    title: lang === 'en' ? 'Diet list' : 'Diyet Listesi',
    startDate: '2026-10-26',
    notes: lang === 'en' ? 'Drink at least 2 litres of water a day.' : 'Günde en az 2 litre su iç.',
    meals: MEALS[lang].map(([name, time, items]) => ({ dayIndex: 0, name, time, items })),
})
const clientId = (await call('GET', '/clients', null, D)).find((c) => c.username === 'Ayşe').id
const saved = await call('POST', `/clients/${clientId}/diet-plans`, plan('tr'), D)

// ---------- Chrome (CDP) ----------
const targets = await (await fetch('http://127.0.0.1:9333/json/list')).json()
const page = targets.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let seq = 0
const pending = new Map()
ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data)
    if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg)
        pending.delete(msg.id)
    }
})
const cdp = (method, params = {}) =>
    new Promise((resolve, reject) => {
        const id = ++seq
        pending.set(id, (msg) => (msg.error ? reject(new Error(method + ': ' + msg.error.message)) : resolve(msg.result)))
        ws.send(JSON.stringify({ id, method, params }))
    })
const evaluate = async (expression) => (await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value

await cdp('Emulation.setDeviceMetricsOverride', { width: 375, height: 700, deviceScaleFactor: 2, mobile: true })
await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })

async function shot(lang, name, path, prepare) {
    await cdp('Page.navigate', { url: APP + path })
    await sleep(2500)
    if (prepare) {
        await evaluate(prepare)
        await sleep(600)
    }
    const { data } = await cdp('Page.captureScreenshot', { format: 'webp', quality: 82 })
    mkdirSync(`${OUT}/${lang}`, { recursive: true })
    writeFileSync(`${OUT}/${lang}/${name}.webp`, Buffer.from(data, 'base64'))
    console.log('saved', lang, name)
}

for (const lang of ['tr', 'en']) {
    await call('PUT', `/clients/${clientId}/diet-plans/${saved.id}`, plan(lang), D)
    await call('PUT', '/intake', intake(lang), C)
    await cdp('Page.navigate', { url: APP + '/login' })
    await sleep(1500)
    await evaluate(`localStorage.clear(); localStorage.setItem('token', ${JSON.stringify(C)}); localStorage.setItem('i18nextLng', '${lang}'); true`)
    await shot(lang, 'home', '/dashboard')
    await shot(lang, 'menu', '/menu')
    await shot(lang, 'chart', '/dashboard', `document.getElementById('kilo').scrollIntoView({ block: 'start' }); true`)
    await shot(lang, 'intake', '/intake')
}
ws.close()
console.log('done')
