// Herkese açık sayfanın içeriği: kampanya, tarifler ve tanıtım. Şimdilik kodda sabit; diyetisyen metinleri sonra değiştirir.
// Her metin dil dil yazılır (tr zorunlu; en, de varsa o dilde gösterilir, yoksa Türkçe). Almanca eklenince yalnızca "de" alanları eklenir.

// Kutucuk zeminleri ve ikon renkleri (tema renkleri)
export type Tone = 'peach' | 'sage' | 'lilac' | 'sky'

export const TONE_CLASSES: Record<Tone, string> = {
    peach: 'bg-peach text-peach-ink',
    sage: 'bg-sage text-brand',
    lilac: 'bg-lilac text-lilac-ink',
    sky: 'bg-sky text-sky-ink',
}

export type Localized = {
    tr: string
    en?: string
    de?: string
}

// Seçili dildeki metin ("en-US" gibi bölgeli diller de olur); o dilde yoksa Türkçe
export function localize(text: Localized, language: string | undefined): string {
    const code = (language ?? 'tr').slice(0, 2) as keyof Localized
    return text[code] ?? text.tr
}

export const CAMPAIGN = {
    tag: { tr: "KASIM'A ÖZEL", en: 'NOVEMBER ONLY', de: 'NUR IM NOVEMBER' },
    title: { tr: '3 aylık pakette %15 indirim', en: '15% off the 3-month package', de: '15 % Rabatt auf das 3-Monats-Paket' },
    text: { tr: 'İlk görüşmede sorularını yanıtlıyoruz.', en: 'We answer your questions in the first call.', de: 'Im ersten Gespräch beantworten wir deine Fragen.' },
}

export type Recipe = {
    id: string
    emoji: string
    tone: Tone
    name: Localized
    minutes: number
    meal: Localized
    ingredients: Localized[]
    steps: Localized[]
}

export const RECIPES: Recipe[] = [
    {
        id: 'yulafli-kase',
        emoji: '🥣',
        tone: 'peach',
        name: { tr: 'Yulaflı kase', en: 'Oat bowl', de: 'Haferflocken-Bowl' },
        minutes: 10,
        meal: { tr: 'Kahvaltı', en: 'Breakfast', de: 'Frühstück' },
        ingredients: [
            { tr: '4 YK yulaf', en: '4 tbsp oats', de: '4 EL Haferflocken' },
            { tr: '1 su bardağı süt veya kefir', en: '1 glass of milk or kefir', de: '1 Glas Milch oder Kefir' },
            { tr: '1 tatlı kaşığı chia', en: '1 tsp chia seeds', de: '1 TL Chiasamen' },
            { tr: 'Yarım muz', en: 'Half a banana', de: 'Eine halbe Banane' },
            { tr: '3 adet ceviz', en: '3 walnuts', de: '3 Walnüsse' },
            { tr: 'Tarçın', en: 'Cinnamon', de: 'Zimt' },
        ],
        steps: [
            { tr: 'Yulafı ve chia tohumunu sütle karıştır, 5 dakika beklet.', en: 'Mix the oats and chia seeds with the milk and let it sit for 5 minutes.', de: 'Haferflocken und Chiasamen mit der Milch verrühren und 5 Minuten quellen lassen.' },
            { tr: 'Üzerine dilimlenmiş muzu ve kırılmış cevizi ekle.', en: 'Top with the sliced banana and crushed walnuts.', de: 'Mit Bananenscheiben und gehackten Walnüssen belegen.' },
            { tr: 'Tarçın serpip servis et.', en: 'Sprinkle with cinnamon and serve.', de: 'Mit Zimt bestreuen und servieren.' },
        ],
    },
    {
        id: 'nohutlu-salata',
        emoji: '🥗',
        tone: 'sage',
        name: { tr: 'Nohutlu salata', en: 'Chickpea salad', de: 'Kichererbsensalat' },
        minutes: 15,
        meal: { tr: 'Öğle', en: 'Lunch', de: 'Mittagessen' },
        ingredients: [
            { tr: '6 YK haşlanmış nohut', en: '6 tbsp boiled chickpeas', de: '6 EL gekochte Kichererbsen' },
            { tr: '1 salatalık', en: '1 cucumber', de: '1 Gurke' },
            { tr: '1 domates', en: '1 tomato', de: '1 Tomate' },
            { tr: 'Yarım kırmızı soğan', en: 'Half a red onion', de: 'Eine halbe rote Zwiebel' },
            { tr: 'Maydanoz', en: 'Parsley', de: 'Petersilie' },
            { tr: '1 YK zeytinyağı, limon', en: '1 tbsp olive oil, lemon', de: '1 EL Olivenöl, Zitrone' },
        ],
        steps: [
            { tr: 'Sebzeleri küçük küpler halinde doğra.', en: 'Dice the vegetables into small cubes.', de: 'Das Gemüse in kleine Würfel schneiden.' },
            { tr: 'Nohut ve maydanozla karıştır.', en: 'Mix with the chickpeas and parsley.', de: 'Mit Kichererbsen und Petersilie mischen.' },
            { tr: 'Zeytinyağı ve limonla tatlandır.', en: 'Season with olive oil and lemon.', de: 'Mit Olivenöl und Zitrone abschmecken.' },
        ],
    },
    {
        id: 'sekersiz-kurabiye',
        emoji: '🍪',
        tone: 'lilac',
        name: { tr: 'Şekersiz kurabiye', en: 'Sugar-free cookies', de: 'Kekse ohne Zucker' },
        minutes: 25,
        meal: { tr: 'Ara öğün', en: 'Snack', de: 'Zwischenmahlzeit' },
        ingredients: [
            { tr: '2 olgun muz', en: '2 ripe bananas', de: '2 reife Bananen' },
            { tr: '1 su bardağı yulaf', en: '1 glass of oats', de: '1 Glas Haferflocken' },
            { tr: '2 YK fıstık ezmesi', en: '2 tbsp peanut butter', de: '2 EL Erdnussbutter' },
            { tr: 'Bir tutam tarçın', en: 'A pinch of cinnamon', de: 'Eine Prise Zimt' },
        ],
        steps: [
            { tr: 'Muzları ezip diğer malzemelerle karıştır.', en: 'Mash the bananas and mix with the other ingredients.', de: 'Die Bananen zerdrücken und mit den übrigen Zutaten vermengen.' },
            { tr: 'Kaşıkla yağlı kâğıda küçük kurabiyeler şeklinde diz.', en: 'Spoon small cookies onto baking paper.', de: 'Mit einem Löffel kleine Kekse auf Backpapier setzen.' },
            { tr: '180 derece fırında 15 dakika pişir.', en: 'Bake at 180 °C for 15 minutes.', de: 'Bei 180 °C 15 Minuten backen.' },
        ],
    },
    {
        id: 'firinda-somon',
        emoji: '🐟',
        tone: 'sky',
        name: { tr: 'Fırında somon', en: 'Baked salmon', de: 'Lachs aus dem Ofen' },
        minutes: 20,
        meal: { tr: 'Akşam', en: 'Dinner', de: 'Abendessen' },
        ingredients: [
            { tr: '150 gr somon', en: '150 g salmon', de: '150 g Lachs' },
            { tr: 'Brokoli ve kabak', en: 'Broccoli and zucchini', de: 'Brokkoli und Zucchini' },
            { tr: '1 YK zeytinyağı', en: '1 tbsp olive oil', de: '1 EL Olivenöl' },
            { tr: 'Limon, dereotu', en: 'Lemon, dill', de: 'Zitrone, Dill' },
            { tr: 'Tuz, karabiber', en: 'Salt, black pepper', de: 'Salz, schwarzer Pfeffer' },
        ],
        steps: [
            { tr: 'Somonu ve sebzeleri tepsiye yerleştir, zeytinyağı gezdir.', en: 'Place the salmon and vegetables on a tray and drizzle with olive oil.', de: 'Lachs und Gemüse auf ein Blech legen und mit Olivenöl beträufeln.' },
            { tr: 'Baharatla ve limonla tatlandır.', en: 'Season with spices and lemon.', de: 'Mit Gewürzen und Zitrone würzen.' },
            { tr: '200 derece fırında 15-18 dakika pişir, dereotuyla servis et.', en: 'Bake at 200 °C for 15–18 minutes and serve with dill.', de: 'Bei 200 °C 15–18 Minuten backen und mit Dill servieren.' },
        ],
    },
]

export const ABOUT = {
    title: { tr: 'Merhaba, ben Betül 👋', en: "Hi, I'm Betül 👋", de: 'Hallo, ich bin Betül 👋' },
    text: {
        tr: 'Diyeti bir yasak listesi değil, hayatına uyan bir düzen olarak görüyorum. Sevdiğin yemeklerden vazgeçmeden, adım adım.',
        en: "I don't see a diet as a list of bans but as a routine that fits your life. Step by step, without giving up the food you love.",
        de: 'Für mich ist eine Diät keine Verbotsliste, sondern eine Routine, die zu deinem Leben passt. Schritt für Schritt, ohne auf dein Lieblingsessen zu verzichten.',
    },
    tags: [
        { label: { tr: 'Kilo yönetimi', en: 'Weight management', de: 'Gewichtsmanagement' }, tone: 'sage' as Tone },
        { label: { tr: 'Sporcu beslenmesi', en: 'Sports nutrition', de: 'Sporternährung' }, tone: 'peach' as Tone },
        { label: { tr: 'Sağlıklı alışkanlık', en: 'Healthy habits', de: 'Gesunde Gewohnheiten' }, tone: 'lilac' as Tone },
    ],
}

export const DIETITIAN = {
    name: 'Dyt. Betül Bağcı',
    // Gerçek fotoğraf: dosyayı client/public/ klasörüne koy (ör. dietitian.webp, dikey, en az 900 px genişlik)
    // ve buraya '/dietitian.webp' yaz. Boşken (null) yer tutucu çizim gösterilir.
    photo: null as string | null,
}
