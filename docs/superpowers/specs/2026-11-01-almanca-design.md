# Almanca dil desteği ve sunucu mesajlarının çevirisi: tasarım

Tarih: 2026-11-01 · Durum: kullanıcı "önce Almanca" dedi. Ayrıntılar bana bırakıldı (canlıya çıkmadan önce Almanca eklenecekti).

## Neden

Uygulama Türkçe ve İngilizce. Almanca konuşan danışanlar da hedefleniyor (eşimin danışan kitlesi). Ayrıca sunucudan gelen hata mesajları her dilde Türkçe görünüyor, örneğin "Bu e-posta adresi zaten kayıtlı". İngilizce ve Almanca kullanıcı bunları kendi dilinde görmeli.

## Hedefler

1. **Arayüzün tamamı Almanca:**
   - `locales/de.json`, `tr.json` ile birebir aynı anahtarlar;
   - dil seçicide TR · EN · DE;
   - tarih ve sayılar `de` biçiminde (zaten `toLocale…(i18n.language)` ile).
2. **Tanıtım sayfası:**
   - kampanya, tarifler ve "Hakkımda" metinlerine `de` alanları;
   - Almanca ekran görüntüleri: `public/showcase/de/*.webp`, mevcut betikle, menü Almanca.
3. **KVKK metinleri:** Almanca bilgi amaçlı çeviri (`PRIVACY_TEXT_DE`, `CONSENT_TEXT_DE`). Bağlayıcı olan Türkçe metindir (İngilizcedeki gibi), sürüm her dilde aynı.
4. **Sunucu mesajları kullanıcının dilinde:** sunucu Türkçe mesaj göndermeye devam eder. Ön yüz, bilinen mesajları seçili dile çevirir; bilinmeyen mesajı olduğu gibi gösterir.
5. **Eksik çeviriyi engelleyen bekçi testi:** sunucuya yeni bir kullanıcı mesajı eklenip çevirisi unutulursa bir backend testi başarısız olur.

## Hitap ve dil

- Danışana Almancada **"du"** ile hitap edilir; Türkçedeki "sen"in karşılığı, diyet ve sağlık uygulamalarında yaygın.
- Diyetisyene özel yönetim metinlerinde **"Sie"**; Türkçedeki "siz"in karşılığı.
- Marka ve sabitler çevrilmez: "tane." logosu, "Dyt. Betül Bağcı", "KVKK" kısaltması. KVKK ilk geçtiği yerde Almanca açıklamasıyla yazılır: "KVKK (türkisches Datenschutzgesetz)".
- **Çeviriyi ben yapıyorum.** Ana dili Almanca olan biri canlıdan önce okumalı. Bu canlıya çıkış kontrol listesine eklenir.

## Tasarım

### 1. Arayüz (ön yüz)

- **`src/i18n/locales/de.json`:**
  - `tr.json` ile aynı anahtar ağacı;
  - çoğul anahtarlar (`_one`, `_other`) Almanca kurallarına göre;
  - `Trans` etiketleri (`<em>`, `<br/>`, `<privacy>`) aynen korunur.
- **`src/i18n/index.ts`:** `de` kaynağı eklenir, `supportedLngs: ['tr', 'en', 'de']`. Tarayıcı dili Almancaysa ilk açılışta Almanca gelir (dil algılayıcı zaten var).
- **`LanguageToggle`:**
  - TR · EN · DE düğmeleri; seçili dil `i18n.resolvedLanguage`'dan okunur;
  - 360 px telefonda üst satıra (logo + dil + "Danışan girişi") sığmalı. Gerekirse düğmeler küçülür.
- **Eksik anahtar kontrolü:** `scripts/check-locales.mjs`. Üç dosyanın anahtar ağacını karşılaştırır, eksik ya da fazla anahtarı listeler, fark varsa hata koduyla çıkar. `npm run check:locales` olarak eklenir.

### 2. Tanıtım sayfası

- `landing/content.ts` içindeki her `Localized` metne `de` eklenir.
- `client/scripts/showcase-shots.mjs`:
  - dil listesine `de`;
  - örnek menü ve form cevaplarının Almanca hali.
- `AppShowcase`'te `SHOT_LANGUAGES` listesine `de` eklenir.
- `index.html` içindeki paylaşım önizlemesi metinleri Türkçe kalır; sayfa tek bir HTML olduğu için dil başına ayrı önizleme yok.

### 3. KVKK metinleri (sunucu)

- `LegalTexts`:
  - `PRIVACY_TEXT_DE`, `CONSENT_TEXT_DE`, en baştaki "bağlayıcı olan Türkçe metindir" notuyla;
  - `hasTranslation(lang)` → `"en"` ve `"de"`;
  - `LegalController` dile göre metni seçer.
- `LegalControllerTest`: `privacyInGermanWhenAsked`, `consentVersionIsSameInGerman`.

### 4. Sunucu mesajlarının çevirisi

- **Kaynak:** `client/src/i18n/serverErrors.json` dosyası, `{ "<Türkçe mesaj>": { "en": "...", "de": "..." } }` biçiminde.
  - Anahtar, sunucunun gönderdiği Türkçe metnin kendisi.
  - Sonu değişken olan mesajlar ön ek olarak yazılır. Örneğin `"Danışan bulunamadı, id: "` anahtarı, `"Danışan bulunamadı, id: 41"` mesajını karşılar; çeviride değişken kısım atılır.
- **`services/errorMessage.ts`:**
  - backend mesajı varsa ve dil Türkçe değilse, mesaj önce tam eşleşmeyle, sonra en uzun ön ek eşleşmesiyle aranır;
  - bulunursa o dildeki çeviri gösterilir, bulunmazsa Türkçe mesaj olduğu gibi gösterilir.
  - 500 için de geçerli: "Beklenmeyen bir hata oluştu" da çevrilir.
- **Sunucu tarafı değişmez.** Mesajlar, testler ve log Türkçe kalır.
- **Benim kararım:** Accept-Language ve `MessageSource` ile sunucuda çeviri daha "standart" bir yol olurdu. Ama yaklaşık 140 mesajı koda dönüştürmeyi ve bütün testlerin mesaj kontrollerini değiştirmeyi gerektirir. Çevirileri arayüz metinleriyle aynı yerde tutmak çevirmen için de daha kolay.
- **Bekçi testi:** `ServerMessagesTranslatedTest` (backend, `src/test`).
  - `src/main/java` altındaki kullanıcıya giden Türkçe mesaj kalıplarını tarar:
    - `new XxxException("...")` ve `new XxxException("..." + …)` içindeki ilk metin;
    - doğrulama notlarındaki `message = "..."`;
    - `MESSAGE = "..."` sabitleri;
    - `GlobalExceptionHandler` içindeki `message = "..."` atamaları;
    - `UnexpectedErrorResolver` ve `JwtAuthFilter` sabitleri.
  - Her birinin `../client/src/i18n/serverErrors.json` içinde `en` ve `de` çevirisi olduğunu kontrol eder. Eksik varsa adını yazarak başarısız olur.
  - Yalnızca loga ya da sunucu içine giden metinler hariç tutulur, örneğin `log.error`.

### İnceleyici soruları üzerine kararlarım
- Kodu ve çevirileri ben yazıyorum, Almanca ekran görüntülerini de ben çekiyorum (önceki adımlardaki gibi).
- Bekçi testi `client/` klasörünü bulamazsa atlanır (`Assumptions`). Arka uç tek başına derlenirse, ör. ileride Docker'da, test kırılmasın. Yerelde iki klasör hep birlikte durduğu için koruma çalışır. Canlıya çıkış listesine not düşülür.
- Bekçi testi şunları dışarıda bırakır:
  - `AccessDeniedException` metinleri: kullanıcıya hiç gitmez, 403'te ön yüz kendi metnini gösterir;
  - kaldırılmış görev ekranının `/tasks` mesajları.
- Bekçi testi, metni bir sonraki satırda başlayan `new XxxException(` çağrılarını da tanır.
- `de-DE`, `de-AT` gibi bölgeli dil kodları ilk iki harfe indirilir. Bu dil seçicide, KVKK isteğinde, ekran görüntülerinde ve sunucu mesajı çevirisinde geçerli.

### 5. Kapsam dışı

- **Diyetisyenin "Hazırlar" örnekleri** (`DietLibraryDefaults`): diyetisyenin kendi içeriği, Türkçe kalır.
- **Diyetisyenin yazdığı menüler, notlar ve tarif dışı içerik:** kullanıcı verisi, çevrilmez.
- **`index.html` paylaşım önizlemesi** ve uygulama manifesti: Türkçe kalır.
- **E-posta yok:** uygulama e-posta göndermiyor.

## Kabul ölçütleri

- `npm run check:locales` farksız.
- `npm run build` ve `npm run lint` temiz.
- Backend birim süiti, bekçi testi dahil, ve `ProjectApplicationTests` geçer.
- Tarayıcıda 375 px Almanca olarak gezilir:
  - tanıtım sayfası;
  - giriş;
  - danışan ana sayfası ve menü;
  - ön görüşme formu;
  - KVKK sayfası ve onay ekranı;
  - diyetisyen danışan listesi ve danışan sayfası;
  - diyet editörü;
  - sunucu hatası örneği: yanlış şifre ve kayıtlı e-posta Almanca görünür.
- Taşan ya da kesilen metin olmamalı (Almanca kelimeler uzun).
- 360 px'te üst satır sığar.
