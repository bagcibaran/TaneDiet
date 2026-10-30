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
    tag: { tr: "KASIM'A ÖZEL", en: 'NOVEMBER ONLY' },
    title: { tr: '3 aylık pakette %15 indirim', en: '15% off the 3-month package' },
    text: { tr: 'İlk görüşmede sorularını yanıtlıyoruz.', en: 'We answer your questions in the first call.' },
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
        name: { tr: 'Yulaflı kase', en: 'Oat bowl' },
        minutes: 10,
        meal: { tr: 'Kahvaltı', en: 'Breakfast' },
        ingredients: [
            { tr: '4 YK yulaf', en: '4 tbsp oats' },
            { tr: '1 su bardağı süt veya kefir', en: '1 glass of milk or kefir' },
            { tr: '1 tatlı kaşığı chia', en: '1 tsp chia seeds' },
            { tr: 'Yarım muz', en: 'Half a banana' },
            { tr: '3 adet ceviz', en: '3 walnuts' },
            { tr: 'Tarçın', en: 'Cinnamon' },
        ],
        steps: [
            { tr: 'Yulafı ve chia tohumunu sütle karıştır, 5 dakika beklet.', en: 'Mix the oats and chia seeds with the milk and let it sit for 5 minutes.' },
            { tr: 'Üzerine dilimlenmiş muzu ve kırılmış cevizi ekle.', en: 'Top with the sliced banana and crushed walnuts.' },
            { tr: 'Tarçın serpip servis et.', en: 'Sprinkle with cinnamon and serve.' },
        ],
    },
    {
        id: 'nohutlu-salata',
        emoji: '🥗',
        tone: 'sage',
        name: { tr: 'Nohutlu salata', en: 'Chickpea salad' },
        minutes: 15,
        meal: { tr: 'Öğle', en: 'Lunch' },
        ingredients: [
            { tr: '6 YK haşlanmış nohut', en: '6 tbsp boiled chickpeas' },
            { tr: '1 salatalık', en: '1 cucumber' },
            { tr: '1 domates', en: '1 tomato' },
            { tr: 'Yarım kırmızı soğan', en: 'Half a red onion' },
            { tr: 'Maydanoz', en: 'Parsley' },
            { tr: '1 YK zeytinyağı, limon', en: '1 tbsp olive oil, lemon' },
        ],
        steps: [
            { tr: 'Sebzeleri küçük küpler halinde doğra.', en: 'Dice the vegetables into small cubes.' },
            { tr: 'Nohut ve maydanozla karıştır.', en: 'Mix with the chickpeas and parsley.' },
            { tr: 'Zeytinyağı ve limonla tatlandır.', en: 'Season with olive oil and lemon.' },
        ],
    },
    {
        id: 'sekersiz-kurabiye',
        emoji: '🍪',
        tone: 'lilac',
        name: { tr: 'Şekersiz kurabiye', en: 'Sugar-free cookies' },
        minutes: 25,
        meal: { tr: 'Ara öğün', en: 'Snack' },
        ingredients: [
            { tr: '2 olgun muz', en: '2 ripe bananas' },
            { tr: '1 su bardağı yulaf', en: '1 glass of oats' },
            { tr: '2 YK fıstık ezmesi', en: '2 tbsp peanut butter' },
            { tr: 'Bir tutam tarçın', en: 'A pinch of cinnamon' },
        ],
        steps: [
            { tr: 'Muzları ezip diğer malzemelerle karıştır.', en: 'Mash the bananas and mix with the other ingredients.' },
            { tr: 'Kaşıkla yağlı kâğıda küçük kurabiyeler şeklinde diz.', en: 'Spoon small cookies onto baking paper.' },
            { tr: '180 derece fırında 15 dakika pişir.', en: 'Bake at 180 °C for 15 minutes.' },
        ],
    },
    {
        id: 'firinda-somon',
        emoji: '🐟',
        tone: 'sky',
        name: { tr: 'Fırında somon', en: 'Baked salmon' },
        minutes: 20,
        meal: { tr: 'Akşam', en: 'Dinner' },
        ingredients: [
            { tr: '150 gr somon', en: '150 g salmon' },
            { tr: 'Brokoli ve kabak', en: 'Broccoli and zucchini' },
            { tr: '1 YK zeytinyağı', en: '1 tbsp olive oil' },
            { tr: 'Limon, dereotu', en: 'Lemon, dill' },
            { tr: 'Tuz, karabiber', en: 'Salt, black pepper' },
        ],
        steps: [
            { tr: 'Somonu ve sebzeleri tepsiye yerleştir, zeytinyağı gezdir.', en: 'Place the salmon and vegetables on a tray and drizzle with olive oil.' },
            { tr: 'Baharatla ve limonla tatlandır.', en: 'Season with spices and lemon.' },
            { tr: '200 derece fırında 15-18 dakika pişir, dereotuyla servis et.', en: 'Bake at 200 °C for 15–18 minutes and serve with dill.' },
        ],
    },
]

export const ABOUT = {
    title: { tr: 'Merhaba, ben Betül 👋', en: "Hi, I'm Betül 👋" },
    text: {
        tr: 'Diyeti bir yasak listesi değil, hayatına uyan bir düzen olarak görüyorum. Sevdiğin yemeklerden vazgeçmeden, adım adım.',
        en: "I don't see a diet as a list of bans but as a routine that fits your life. Step by step, without giving up the food you love.",
    },
    tags: [
        { label: { tr: 'Kilo yönetimi', en: 'Weight management' }, tone: 'sage' as Tone },
        { label: { tr: 'Sporcu beslenmesi', en: 'Sports nutrition' }, tone: 'peach' as Tone },
        { label: { tr: 'Sağlıklı alışkanlık', en: 'Healthy habits' }, tone: 'lilac' as Tone },
    ],
}

export const DIETITIAN = {
    name: 'Dyt. Betül Bağcı',
}
