// Herkese açık sayfanın içeriği: kampanya, tarifler ve tanıtım. Şimdilik kodda sabit; diyetisyen metinleri sonra değiştirir.
// Menüler gibi içerik Türkçe yazılır ve çevrilmez (arayüz yazıları i18n'de).

// Kutucuk zeminleri ve ikon renkleri (tema renkleri)
export type Tone = 'peach' | 'sage' | 'lilac' | 'sky'

export const TONE_CLASSES: Record<Tone, string> = {
    peach: 'bg-peach text-peach-ink',
    sage: 'bg-sage text-brand',
    lilac: 'bg-lilac text-lilac-ink',
    sky: 'bg-sky text-sky-ink',
}

export const CAMPAIGN = {
    tag: "KASIM'A ÖZEL",
    title: '3 aylık pakette %15 indirim',
    text: 'İlk görüşmede sorularını yanıtlıyoruz.',
}

export type Recipe = {
    id: string
    emoji: string
    tone: Tone
    name: string
    minutes: number
    meal: string
    ingredients: string[]
    steps: string[]
}

export const RECIPES: Recipe[] = [
    {
        id: 'yulafli-kase',
        emoji: '🥣',
        tone: 'peach',
        name: 'Yulaflı kase',
        minutes: 10,
        meal: 'Kahvaltı',
        ingredients: ['4 YK yulaf', '1 su bardağı süt veya kefir', '1 tatlı kaşığı chia', 'Yarım muz', '3 adet ceviz', 'Tarçın'],
        steps: [
            'Yulafı ve chia tohumunu sütle karıştır, 5 dakika beklet.',
            'Üzerine dilimlenmiş muzu ve kırılmış cevizi ekle.',
            'Tarçın serpip servis et.',
        ],
    },
    {
        id: 'nohutlu-salata',
        emoji: '🥗',
        tone: 'sage',
        name: 'Nohutlu salata',
        minutes: 15,
        meal: 'Öğle',
        ingredients: ['6 YK haşlanmış nohut', '1 salatalık', '1 domates', 'Yarım kırmızı soğan', 'Maydanoz', '1 YK zeytinyağı, limon'],
        steps: [
            'Sebzeleri küçük küpler halinde doğra.',
            'Nohut ve maydanozla karıştır.',
            'Zeytinyağı ve limonla tatlandır.',
        ],
    },
    {
        id: 'sekersiz-kurabiye',
        emoji: '🍪',
        tone: 'lilac',
        name: 'Şekersiz kurabiye',
        minutes: 25,
        meal: 'Ara öğün',
        ingredients: ['2 olgun muz', '1 su bardağı yulaf', '2 YK fıstık ezmesi', 'Bir tutam tarçın'],
        steps: [
            'Muzları ezip diğer malzemelerle karıştır.',
            'Kaşıkla yağlı kâğıda küçük kurabiyeler şeklinde diz.',
            '180 derece fırında 15 dakika pişir.',
        ],
    },
    {
        id: 'firinda-somon',
        emoji: '🐟',
        tone: 'sky',
        name: 'Fırında somon',
        minutes: 20,
        meal: 'Akşam',
        ingredients: ['150 gr somon', 'Brokoli ve kabak', '1 YK zeytinyağı', 'Limon, dereotu', 'Tuz, karabiber'],
        steps: [
            'Somonu ve sebzeleri tepsiye yerleştir, zeytinyağı gezdir.',
            'Baharatla ve limonla tatlandır.',
            '200 derece fırında 15-18 dakika pişir, dereotuyla servis et.',
        ],
    },
]

export const ABOUT = {
    title: 'Merhaba, ben Betül 👋',
    text: 'Diyeti bir yasak listesi değil, hayatına uyan bir düzen olarak görüyorum. Sevdiğin yemeklerden vazgeçmeden, adım adım.',
    tags: [
        { label: 'Kilo yönetimi', tone: 'sage' as Tone },
        { label: 'Sporcu beslenmesi', tone: 'peach' as Tone },
        { label: 'Sağlıklı alışkanlık', tone: 'lilac' as Tone },
    ],
}

export const DIETITIAN = {
    name: 'Dyt. Betül Bağcı',
}
