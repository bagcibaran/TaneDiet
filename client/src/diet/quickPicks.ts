// Menü hazırlarken üstten tek dokunuşla eklenebilen hazır öğünler ve maddeler.
// İlk liste diyetisyenin örnek diyet listesinden çıkarıldı; zamanla genişletilecek.
// Menü içeriği Türkçe yazıldığı için maddeler çevrilmez.

export type MealPreset = { name: string; time: string }

export const MEAL_PRESETS: MealPreset[] = [
    { name: 'Uyanış', time: '08:00' },
    { name: 'Kahvaltı', time: '09:00' },
    { name: 'Ara öğün', time: '11:00' },
    { name: 'Öğle', time: '13:00' },
    { name: 'Ara öğün', time: '16:00' },
    { name: 'Akşam', time: '19:00' },
    { name: 'Ara öğün', time: '21:00' },
]

export type QuickPickCategory = { key: string; items: string[] }

export const QUICK_PICKS: QuickPickCategory[] = [
    {
        key: 'breakfast',
        items: [
            '2 haşlanmış yumurta',
            '1 dilim kara buğday ekmeği',
            '1 dilim tam buğday ekmeği',
            '5 tane zeytin',
            '1 YK zeytinyağı',
            '30 gr beyaz peynir',
            '2 YK lor peyniri',
            'Koyu yapraklı yeşillik, havuç, biber, salatalık sınırsız',
        ],
    },
    {
        key: 'protein',
        items: [
            '4 köfte kadar et (120 gr et)',
            '1 parça tavuk göğsü (150 gr)',
            '125-150 gr somon',
            '120 gr ızgara balık',
            '8 YK sebze yemeği',
            '6 YK kurubaklagil yemeği',
        ],
    },
    {
        key: 'carb',
        items: [
            '1 dilim ekmek',
            '120 gr pilav',
            '120 gr makarna',
            '4 YK bulgur pilavı',
            '1 kase çorba (1 kepçe)',
        ],
    },
    {
        key: 'salad',
        items: ['Mevsim salata (1 YK zeytinyağı, limon, soğan)', 'Çoban salata', 'Yeşil salata (sınırsız)'],
    },
    {
        key: 'fruit',
        items: ['1 adet muz', '1 KB yeşil elma', '1 KB armut', '2 KB mandalina', '1 porsiyon meyve', '100 ml havuç suyu'],
    },
    {
        key: 'nuts',
        items: ['2 adet ceviz', '6 adet badem', '6 adet KB fındık', '4 adet kaju', '1 YK kabak çekirdeği'],
    },
    {
        key: 'dairy',
        items: ['1 kase yoğurt', '1 su bardağı ayran', '1 su bardağı kefir', '1 su bardağı süt'],
    },
    {
        key: 'drinks',
        items: [
            '1 çay bardağı açık çay',
            '1 bardak kahve',
            '50 ml shot',
            'Taze nane çayı',
            'Kiraz sapı çayı',
            '100 ml hindistan cevizi kahve',
        ],
    },
]
