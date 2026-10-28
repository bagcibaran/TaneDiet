package com.project.project.service.impl;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Her diyetisyene bir kez yüklenen örnek hazır öğünler ve hızlı maddeler.
// Diyetisyenin örnek diyet listesinden çıkarıldı; sonra diyetisyen kendisi düzenler.
final class DietLibraryDefaults {

    record MealPreset(String name, String time) {
    }

    // Maddesiz öğünler: eklenince yalnızca adı ve saati gelir
    static final List<MealPreset> MEALS = List.of(
            new MealPreset("Uyanış", "08:00"),
            new MealPreset("Kahvaltı", "09:00"),
            new MealPreset("Ara öğün", "11:00"),
            new MealPreset("Öğle", "13:00"),
            new MealPreset("Ara öğün", "16:00"),
            new MealPreset("Akşam", "19:00"),
            new MealPreset("Ara öğün", "21:00")
    );

    // Kategori adı → maddeler (sıra korunur)
    static final Map<String, List<String>> CATEGORIES = new LinkedHashMap<>();

    static {
        CATEGORIES.put("Kahvaltılık", List.of(
                "2 haşlanmış yumurta",
                "1 dilim kara buğday ekmeği",
                "1 dilim tam buğday ekmeği",
                "5 tane zeytin",
                "1 YK zeytinyağı",
                "30 gr beyaz peynir",
                "2 YK lor peyniri",
                "Koyu yapraklı yeşillik, havuç, biber, salatalık sınırsız"
        ));
        CATEGORIES.put("Protein", List.of(
                "4 köfte kadar et (120 gr et)",
                "1 parça tavuk göğsü (150 gr)",
                "125-150 gr somon",
                "120 gr ızgara balık",
                "8 YK sebze yemeği",
                "6 YK kurubaklagil yemeği"
        ));
        CATEGORIES.put("Karbonhidrat", List.of(
                "1 dilim ekmek",
                "120 gr pilav",
                "120 gr makarna",
                "4 YK bulgur pilavı",
                "1 kase çorba (1 kepçe)"
        ));
        CATEGORIES.put("Salata", List.of(
                "Mevsim salata (1 YK zeytinyağı, limon, soğan)",
                "Çoban salata",
                "Yeşil salata (sınırsız)"
        ));
        CATEGORIES.put("Meyve", List.of(
                "1 adet muz",
                "1 KB yeşil elma",
                "1 KB armut",
                "2 KB mandalina",
                "1 porsiyon meyve",
                "100 ml havuç suyu"
        ));
        CATEGORIES.put("Kuruyemiş", List.of(
                "2 adet ceviz",
                "6 adet badem",
                "6 adet KB fındık",
                "4 adet kaju",
                "1 YK kabak çekirdeği"
        ));
        CATEGORIES.put("Süt ürünleri", List.of(
                "1 kase yoğurt",
                "1 su bardağı ayran",
                "1 su bardağı kefir",
                "1 su bardağı süt"
        ));
        CATEGORIES.put("İçecek", List.of(
                "1 çay bardağı açık çay",
                "1 bardak kahve",
                "50 ml shot",
                "Taze nane çayı",
                "Kiraz sapı çayı",
                "100 ml hindistan cevizi kahve"
        ));
    }

    private DietLibraryDefaults() {
    }
}
