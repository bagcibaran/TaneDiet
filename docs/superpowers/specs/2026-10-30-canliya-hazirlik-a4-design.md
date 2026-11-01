# Canlıya hazırlık, 1. kısım (A4-A5, sunucudan bağımsız işler): tasarım

Tarih: 2026-10-30 · Durum: kullanıcı "başla" dedi; ayrıntıları bana bıraktı.

## Neden

Uygulama yakında eşimle denenecek, sonra canlıya çıkacak. Sunucu seçimine bağlı olmayan beş iş canlıdan önce bitmeli:
- bilinen bir güvenlik uyarısı (Tomcat);
- güvenlik boşluğu: diyetisyen token'ı DB'den kontrol edilmiyor;
- tarih kayması riski: sunucu saat dilimi;
- danışan sayısıyla büyüyen yavaşlık;
- canlıda hataları göremememiz.

Sunucuya bağlı işler (prod profili, CORS'un ortamdan okunması, sağlık kontrolü, Docker Compose) ve Almanca **bu işin kapsamı dışında**.

## 1. Spring Boot güncellemesi

- `spring-boot-starter-parent` 4.1.1 → **4.1.2**.
  - Maven Central'daki en yeni kararlı yama sürümü bu; 4.2.0 henüz RC.
  - Bu yama, Tomcat dahil bağımlılıkların güvenlik düzeltmelerini getirir.
- Başka bağımlılık değişmez.
- **Kabul ölçütü:**
  - bütün birim testleri ve `ProjectApplicationTests` geçer;
  - uygulama açılır;
  - çözülen Tomcat sürümü 4.1.1'dekinden yeni ya da aynı ve en güncel olur (`mvnw dependency:tree` ile görülür).

## 2. Her istekte kullanıcı kontrolü (diyetisyen dahil)

**Bugün:**
- `JwtAuthFilter` yalnızca CLIENT token'larında kullanıcıyı DB'den okuyor.
- Diyetisyen hesabı silinirse ya da rolü değişirse eski token süresi dolana kadar (en fazla `JWT_EXPIRATION_MS`) tam yetkiyle çalışmaya devam ediyor.

**Yeni:**
- Rolü ne olursa olsun, açık yollar (`/auth/**`, `/legal/**`) dışındaki her istekte kullanıcı DB'den okunur.
- Kullanıcı yoksa ya da DB'deki rolü token'daki rolden farklıysa istek kimliksiz devam eder. Korumalı yol 401 alır; ön yüz bunu zaten "oturum süresi doldu" olarak giriş sayfasına çevirir.
- CLIENT için mevcut kontroller aynı sırayla kalır: kilit (423), sonra rıza (428).
- Açık yollarda DB'ye bakılmaz (bugünkü gibi).

**Bedeli:** diyetisyen isteklerinde de kullanıcı başına bir sorgu. Danışanlarda zaten var.

## 3. Saat dilimi

**Bugün:**
- "Bugün" ve zaman damgaları karışık.
- Servislerin bir kısmı `Clock` (Europe/Istanbul) kullanıyor.
- Entity'ler (`createdAt`, `updatedAt`, `reviewedAt` …) ve birkaç servis (`WeightEntryService.buildSummary`, `IntakeFormService` ilk kayıt, `IntakeFormResponse.age`) `LocalDate.now()` / `LocalDateTime.now()` kullanıyor, yani JVM'in varsayılan saat dilimini.
- Sunucu UTC'de çalışırsa:
  - kilo özetindeki "bugün" gece 00:00–03:00 arası bir gün geride kalır;
  - "yeni" bildirimleri ve erişim kayıtları farklı saat dilimlerinde karışır.

**Yeni:**
- **Tek kaynak:** `config/TimeConfig.ZONE = ZoneId.of("Europe/Istanbul")`. `Clock` bean'i bunu kullanır.
- **JVM varsayılan saat dilimi** uygulama açılırken `TimeConfig.ZONE`'a ayarlanır (`ProjectApplication.main`, `SpringApplication.run`'dan önce). Böylece entity'lerdeki `now()` ve kütüphaneler de Türkiye saatini kullanır.
  - Benim kararım: bütün entity'lere `Clock` taşımak yerine bunu seçtim. Aynı sonucu çok daha az değişiklikle verir.
- **`Clock`'u zaten olan servislerde** kalan `now()` çağrıları `now(clock)` olur: `WeightEntryService.buildSummary`, `IntakeFormService` (rıza zamanı ve ilk kilo tarihi). Böylece testlerde tarih sabitlenebilir.
- **`IntakeFormResponse.age`** bugünü dışarıdan alır: `IntakeFormResponse(IntakeForm, LocalDate today)`. Çağıran servisler `LocalDate.now(clock)` verir.
- **Veritabanı:** sütunlar `DATETIME`/`DATE` (saat dilimsiz). JVM saat dilimi sabitlendiği için yazılan ve okunan değerler aynı kalır; bağlantı ayarı değişmez.

## 4. Danışan listesinin hızı (`GET /clients`)

**Bugün:** `ClientReviewService.listClients` her danışan için 4 sorgu atıyor (inceleme, kilo sayısı, form, program var mı). 100 danışanda 400'den fazla sorgu demek.

**Yeni:** liste, danışan sayısından bağımsız olarak sabit sayıda sorguyla hazırlanır:
1. danışanlar;
2. bu danışanların incelemeleri (`findAllByClientIn`);
3. formları (`findAllByUserIn`);
4. programı olan danışan id'leri (tek `select distinct`);
5. danışan başına "son incelemeden sonra danışanın kendi girdiği kilo" sayısı: tek gruplanmış sorgu, incelemeyle LEFT JOIN, inceleme yoksa hepsi sayılır.

Sonuç bugünküyle birebir aynı olmalı (`newWeightCount`, `intakeStatus`, `hasPlan`, erişim alanları).

**Kabul ölçütü:** birim testleri aynı senaryoları yeni repository çağrılarıyla doğrular. Uçtan uca kontrolde liste, eski davranışla aynı sayıları verir.

## 5. Loglama ve beklenmeyen hatalar

**Bugün:**
- Beklenmeyen bir hata (ör. `NullPointerException`) Spring'in varsayılan hata yanıtına düşüyor ve uygulama logu yazılmıyor.
- `spring.jpa.show-sql=true` her ortamda açık; her SQL konsola düşüyor.

**Yeni:**
- **Son yakalayıcı:** bir `HandlerExceptionResolver`, Spring'in kendi çözücülerinden **sonra** sıralanır (`WebMvcConfigurer.extendHandlerExceptionResolvers` ile listenin sonuna eklenir). Yalnızca hiçbir çözücünün işlemediği hataları alır.
  - Bizim `@ExceptionHandler`'larımız, `ResponseStatusException`, bozuk JSON (400), yanlış tipte yol değişkeni (400), 404 ve 405 gibi Spring'in bugün işlediği her şey bugünkü durum kodu ve gövdesiyle kalır. *Benim kararım (inceleyici sorusu):* `@ExceptionHandler(Exception.class)` bunları yutup 500 yapardı.
  - Yanıt 500, gövde `ErrorResponse {status: 500, message: "Beklenmeyen bir hata oluştu"}`, iç ayrıntı yok.
  - Sunucu logunda `log.error` ile istek yöntemi, **eşleşen yol kalıbı** ve hata yığını yazılır. Kalıp `HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE`'tan alınır, ör. `/auth/invites/{token}`; kalıp yoksa `(eşleşmeyen yol)` yazılır. Gerçek yol yazılmaz: davet token'ı loga düşmesin. *Benim kararım.*
  - **Kişisel veri loglanmaz:** istek gövdesi, kullanıcı adı ve e-posta yazılmaz.
  - **İstemci bağlantıyı kopardıysa** (`ClientAbortException`, `AsyncRequestNotUsableException`) hata loglanmaz ve yanıt yazılmaz.
- **`show-sql`** varsayılan olarak kapalı. Yerelde açmak isteyen `application-local.properties`'e yazar.
- **Log seviyeleri:** uygulama paketi `INFO`, Hibernate SQL kapalı. Canlıdaki log dosyası ve formatı sunucu seçimine kalır.

## Kapsam dışı

- **Prod profili:** CORS'un ortamdan okunması, sağlık kontrolü (actuator), log dosyası.
- **Docker Compose.**
- **Almanca** ve backend hata mesajlarının çevirisi.
- **jjwt ya da başka kütüphane sürüm yükseltmeleri** (yalnızca Spring Boot yaması).

## Kısıtlar

- Her davranış değişikliği önce başarısız bir testle yazılır (TDD).
- Testler: birim süiti (`.superpowers/suite.txt`) ve `ProjectApplicationTests`.
- Uçtan uca kontrol 8081'deki test sunucusunda yapılır; kullanıcının 8080'deki sunucusuna ve `mvnw clean`'e dokunulmaz.
- Kullanıcı commit eder.
