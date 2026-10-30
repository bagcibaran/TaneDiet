# Diyet programı editörü: üç sütunlu yerleşim (tasarım)

Tarih: 2026-10-30 · Durum: kullanıcı onayladı (düzen B, "normal madde düzenleme kalsın")

## Neden

Diyetisyen (Dyt. Betül Bağcı) programları çoğunlukla **tablet ya da bilgisayardan** yazıyor, telefondan yalnızca zor durumda. Bugünkü editör telefona göre tek sütun:
- yeni programda üç boş öğün (Kahvaltı/Öğle/Akşam) hazır geliyor, çoğu silinmek zorunda kalıyor;
- hazır öğünler ve maddeler üstteki küçük, yapışkan bir panelde sekmelerle saklı (`QuickPanel`, en fazla 2 satır görünür);
- öğün kartları alt alta uzuyor; madde eklemek için yukarı-aşağı kaydırmak gerekiyor.

Amaç: büyük ekranı kullanmak. Solda öğünler, ortada açık öğün, sağda uzun madde listesi; tıklayarak hızlı program yazmak. Bugünkü bütün özellikler kalır.

## Hedefler

1. Yeni program **boş öğünle açılmaz**. Öğünler soldaki "Öğün ekle" listesinden tıklayınca eklenir ve hemen açılır.
2. **≥ lg (1024 px, tablet yatay ve bilgisayar)**: üç sütun.
   - **Sol:** günün öğünleri listesi + "Öğün ekle".
   - **Orta:** açık (seçili) öğün, büyük.
   - **Sağ:** madde kütüphanesi, uzun sütun. Tıklanan madde açık öğüne eklenir.
3. **md (768–1023 px, tablet dik)**: üstte öğün şeridi (telefondaki gibi yatay), altında iki sütun: açık öğün (geniş) + maddeler (~ 260 px, yapışkan). *Benim kararım (inceleyici sorusu): 820 px'te üç sütunda orta sütun ~250 px'e düşüyordu; orta sütunun en geniş kalması öncelikli.*
4. **< md (telefon)**: tek sütun, aynı işlevler.
   - Üstte öğün düğmeleri + "+ Öğün".
   - Ortada açık öğün.
   - "+ Madde" ile alttan açılan madde paneli.
5. Bugünkü bütün özellikler korunur (aşağıdaki liste).

## Korunacak özellikler (bugünkü `DietPlanEditorPage`)

- **Program bilgileri:**
  - Günlük/Haftalık seçimi; haftalıktan günlüğe geçerken onay sorulur.
  - Başlık (zorunlu), başlangıç tarihi, notlar.
- **Haftalıkta günler:**
  - Gün düğmeleri (Pzt–Paz).
  - "Bu günü kopyala" (seçilen günlere).
- **"Mevcut programdan başla":** yalnızca yeni programda, aktif program varsa.
- **Öğün işlemleri:**
  - Ad ve saat düzenleme.
  - Yukarı/aşağı sıralama ve silme.
  - "Hazır öğün yap": aynı ad+saat varsa "güncelle / yeni ekle" sorusu.
  - "Tüm günlere ekle" (haftalık).
- **Maddeler:**
  - **Serbest yazı alanı:** her satır bir madde, " / " ile seçenek. Yazma, düzenleme, kopyala-yapıştır olduğu gibi kalır.
  - Kütüphaneden tıklanan madde son satıra eklenir. "Seçenek olarak ekle ( / )" açıksa madde son satıra " / " ile eklenir.
  - Eklenen öğün kısa süre parlar (geri bildirim).
- **"Düzenle":** hazır öğünleri ve maddeleri yöneten `LibrarySheet` açılır; kaydedilmemiş program kaybolmaz.
- **Kaydetme kuralları:**
  - Başlık zorunlu, en az bir öğün olmalı.
  - Adı ya da maddesi boş öğün varsa uyarılır (haftalıkta hangi gün olduğu söylenir).
  - Kaydedince toast gösterilir ve danışan sayfasına dönülür.
- **Hazırlar yüklenemezse** editör yine çalışır: elle öğün ve madde yazılabilir, "+ Boş öğün" her zaman vardır.

## Yerleşim

### Üst bölüm (sütunların üstünde, tam genişlik)

- **Başlık bölümü (`PageHero`):** geri bağlantısı ve "Yeni diyet programı / Programı düzenle". Bugünkü gibi.
- **"Program bilgileri" kartı:**
  - Günlük/Haftalık, başlık, başlangıç tarihi ve sağda **Kaydet** düğmesi.
  - Altında açılıp kapanan **Notlar**. Not doluysa açık başlar.
- **"Mevcut programdan başla":** bilgi kartının üstünde, bugünkü gibi.
- **Haftalıkta gün şeridi:**
  - Pzt–Paz düğmeleri; o günün öğün sayısı küçük rakamla gösterilir.
  - Yanında "Bu günü kopyala".
- **Kaydetme hatası:** Kaydet'in hemen yanında ya da altında görünür.
  - Benim kararım: hatalar ayrıca toast ile de gösterilir, çünkü sayfa uzun olabilir.

### Sol sütun: "Günün öğünleri" (~ 220 px)

- Günün öğünleri, sırasıyla. Her satırda:
  - ad (boşsa "Adsız öğün"), saat ve madde sayısı;
  - seçili satır dolu yeşil (`bg-brand text-cream`).
- Satıra tıklayınca öğün ortada açılır.
- Seçili satırda yukarı/aşağı okları; telefonda okları orta sütundaki öğün başlığı taşır.
- Altında "Öğün ekle" başlığı:
  - hazır öğünler (ad · saat) ve "+ Boş öğün";
  - tıklanınca öğün **listenin sonuna** eklenir ve seçilir.
  - Benim kararım: saat sırasına göre araya yerleştirilmez. Bugünkü davranış böyle; diyetisyen oklarla taşır.
- Gün boşsa: "Bu gün için öğün yok. Aşağıdan ekle." metni.

### Orta sütun: "Açık öğün" (esnek, en geniş)

- **Hiç öğün yoksa:** "Soldan bir öğün ekleyerek başla" boş durumu.
- **Öğün seçiliyse:**
  - Ad ve saat alanları büyük.
  - Maddeler alanı geniş ve yüksek (≥ 10 satır), satır sayısına göre uzar.
  - Altında "Hazır öğün yap", "Tüm günlere ekle" (yalnızca haftalık) ve sağda kırmızı "Öğünü sil".
  - "Hazır öğün yap" sorusu ve kısa bilgi/hata notları bu kartın altında görünür (bugünkü `cardNotice` / `templateChoice`).
- **Öğün eklendiğinde, bir gün açıldığında, program yüklendiğinde, "Mevcut programdan başla" ve Günlük/Haftalık değişiminde** o günün ilk öğünü otomatik seçilir (eklenen öğün ise kendisi). Seçili öğün silinirse komşusu seçilir. Kaydetme eksik öğün yüzünden durursa o gün açılır ve o öğün seçilir.
- **"Öğünü sil":** maddesi doluysa onay sorulur.
  - Benim kararım: boş öğün sorulmadan silinir.
  - Bugün sorulmadan siliniyordu; büyük tek öğün görünümünde yanlış dokunma daha pahalı.

### Sağ sütun: "Maddeler" (~ 280 px, uzun)

- **Başlık:** "Maddeler → {açık öğünün adı}"; öğün yoksa düğmeler pasif ve "Önce bir öğün ekle" yazar.
- **Arama kutusu:** bütün kategorilerde metin araması, Türkçe küçük harf (`toLocaleLowerCase('tr')`).
- **"Seçenek olarak ekle ( / )" anahtarı** ve **"Düzenle"** (LibrarySheet).
- **Kategoriler alt alta**, her biri başlık + madde düğmeleri (`+ madde`). Sekme yok; uzun sütun kaydırılır.
  - Benim kararım: arama doluyken yalnızca eşleşen maddeler gösterilir.
- **Sütun yapışkan** (`sticky`, ekran yüksekliğinde, kendi içinde kayar): uzun öğün yazarken maddeler hep görünür. Sol sütun da yapışkan.

### Tablet dik (md, 768–1023 px)

- Sol sütun yerine telefondaki yatay **öğün şeridi** (+ Öğün paneli dahil) üstte.
- Altında iki sütun: açık öğün (esnek) ve sağda yapışkan madde sütunu (~ 260 px). "+ Madde" düğmesi ve alt paneli yok.

### Telefon (< md)

- **Program bilgileri ve gün şeridi:** aynı, alt alta.
- **Öğün şeridi:** yatay kaydırılan düğmeler (ad · madde sayısı) ve sonda "+ Öğün".
  - "+ Öğün" alttan açılan bir panelde hazır öğünleri ve "+ Boş öğün"ü gösterir.
- **Açık öğün kartı:** tam genişlik. Başlıkta yukarı/aşağı okları.
- **Ekranın altında sabit "+ Madde" düğmesi** (telefonda tab çubuğunun üstünde; tab çubuğu yoksa (640–767 px) en altta): alttan açılan, ekranın yaklaşık yarısı yüksekliğinde panelde sağ sütunun aynısı (açık öğün ve parlaması arkada görünür kalır).
  - Panel madde ekleyince kapanmaz; birden fazla madde arka arkaya eklenebilir.
  - "Bitti" ile kapanır.
  - Paneller `createPortal` ile çizilir ve güvenli alan boşluğunu (`env(safe-area-inset-bottom)`) ekler.

## Kapsam dışı (bu iş değil)

- Maddeleri satır satır ayrı kutularda düzenleme. Yazı alanı kalır, çünkü " / " ve yapıştırma en hızlısı orada.
- Kalori, sürükle-bırak, otomatik saat sıralaması.
- Backend, API ve veri modeli değişikliği. Yalnızca ön yüz.
- Danışanın gördüğü menü sayfası (`MenuPage`) ve `DietLibraryPage` / `DietLibraryManager`.

## Kısıtlar

- Tema tokenları (`brand`, `card`, `line`, `mint` …), kartlar `rounded-3xl bg-card shadow-soft`. Ham Tailwind renkleri kullanılmaz.
- Metinler `tr.json` ve `en.json`'a eklenir. Diyetisyene özel metinler "siz" dilinde ya da yönetim dilinde kısa tutulur.
  - Almanca sonra eklenecek; yeni anahtarlar düz ve çevrilebilir olmalı.
- Sabit konumlu öğeler animasyonlu (`animate-rise` / `stagger`) bir ebeveynin içine konmaz; portal kullanılır.
- `npm run build` ve `npm run lint` temiz olmalı. Tarayıcıda 375 px (telefon), 820 px (tablet dik, iki sütun) ve 1180 px (tablet yatay / bilgisayar) genişliklerde kontrol edilmeli.
- Sayfa genişliği: editör sayfası üç sütun için normal `PageBody` (`max-w-5xl`) yerine daha geniş olabilir (ör. `max-w-7xl`). Karar kodu yazana kalır.

## Kodu yazana kalanlar

- Bileşen bölümlemesi. Öneri:
  - `DietPlanEditorPage` yalnızca durum ve kaydetme;
  - `components/diet/editor/MealList`, `MealEditor`, `ItemPicker`, `MobileSheet`;
  - `QuickPanel` artık kullanılmıyorsa silinir.
- Tam piksel genişlikleri, ikonlar, boş durum metinlerinin son hali.
- Gün şeridindeki öğün sayısı göstergesinin biçimi.
