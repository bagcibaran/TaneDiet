# Proje devam notu

Bu not, projeye başka bir Claude hesabından kaldığım yerden devam edebilmem için yazıldı. Yeni oturumda Claude'a şunu söyle:

> `DEVAM_NOTU.md` dosyasını ve `CLAUDE.md` dosyasını oku, projeye kaldığımız yerden devam edelim.

Son güncelleme: 20 Ekim 2026. Son commit: `ce49415`.

## 1. Ben kimim, ne yapıyoruz

- Bu projeyi sıfırdan kendim yazıyorum. Amacım Java Spring Boot öğrenmek ve frontend (React/TypeScript) bilgimi tazelemek.
- Hedef: projeyi adım adım, pazarlanabilir bir fullstack **web + mobil** ürüne dönüştürmek.
- Ürün alanı: **diyetisyen uygulaması.** Eşim diyetisyen. Uygulamayı o ve danışanları kullanacak. İki rol var: `DIETITIAN` (diyetisyen) ve `CLIENT` (danışan).
- Şu anki kod, bir "görev yönetimi" (task manager) uygulaması olarak başladı. Diyetisyen özelliklerine geçmeden önce altyapıyı sağlamlaştırıyoruz.

## 2. Benimle nasıl çalışılmalı

- **Türkçe** konuş.
- Ben Spring Boot'u yeni öğreniyorum. **Basit anlat.** Yeni bir kavramı önce gündelik bir benzetmeyle açıkla, sonra koda geç.
- Sadece "şunu yap" deme. **Nasıl yapılacağını göster:** hangi dosya, kodun tamamı (önce/sonra), her satırın ne işe yaradığı ve nasıl kontrol edileceği.
- **Kodu varsayılan olarak ben yazarım.** Sen kodu ve açıklamayı verirsin, ben yazarım, sonra sen değişikliklerimi kontrol edersin. Ben "sen yap" dediğimde kodu doğrudan sen yazarsın, test edersin ve ne yaptığını açıklarsın.
- **Commit'leri her zaman ben yaparım.** Sen commit komutunu önerirsin.
- Büyük adımları parçalara böl (örneğin 2A ve 2B). Her parçanın sonunda bir kontrol yapalım.
- Bir hata aldığımda nedenini bana öğret: hata log'u nasıl okunur, asıl sebep nerede, gibi.

## 3. Ortamım

- Windows 10, PowerShell, IntelliJ IDEA, MySQL Workbench.
- Proje klasörü: `C:\Users\Baran\Desktop\project`
- GitHub: `https://github.com/bagcibaran/demoJavaProject` (main branch)
- `openssl` PowerShell'de yok (Git Bash'te var).
- PowerShell'de API testleri için `Invoke-RestMethod` kullanıyoruz.

## 4. Teknolojiler ve yapı

İki ayrı proje var:

- `project/`: Backend. Spring Boot 4.1.1, Java 25, Maven (`mvnw.cmd`), Spring Security + JWT (jjwt 0.12.6), Spring Data JPA, MySQL, DevTools.
- `client/`: Frontend. React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, i18next (Türkçe varsayılan, İngilizce ikinci dil).

Backend katmanları: `controller` → `service` (interface + `service/impl`) → `repository` → `entity`. İstek ve yanıtlar her zaman `dto/` içindeki sınıflardan geçer, entity doğrudan döndürülmez.

Repo kökünde `CLAUDE.md` var. Mimarinin ayrıntılı açıklaması orada. Bu dosya kök `.gitignore` içinde, yani GitHub'da yok, yalnızca bilgisayarımda.

### Çalıştırma

- Backend: IntelliJ'de Run Configuration → **Active profiles: `local`**. Terminalden:
  ```powershell
  .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
  ```
  Adres: `http://localhost:8080`
- Frontend: `client/` klasöründe `npm run dev`. Adres: `http://localhost:5173`
- Veritabanı: yerel MySQL, `localhost:3306`, veritabanı adı `task_manager`.

## 5. Tamamlanan adımlar

### Adım 1: Gizli bilgileri koddan çıkarmak (commit `f1f2971`)

- `application.properties` artık placeholder kullanıyor:
  - `spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/task_manager}`
  - `spring.datasource.username=${DB_USERNAME:root}`
  - `spring.datasource.password=${DB_PASSWORD}` (varsayılanı yok, zorunlu)
  - `jwt.secret=${JWT_SECRET}` (varsayılanı yok, zorunlu)
  - `jwt.expiration-ms=${JWT_EXPIRATION_MS:3600000}`
- Gerçek değerler `project/src/main/resources/application-local.properties` dosyasında (`DB_PASSWORD`, `JWT_SECRET`). Bu dosya `project/.gitignore` içinde, GitHub'a gitmiyor.
- `JwtService`, anahtarı ve süreyi constructor üzerinden `@Value` ile alıyor. `getBytes(StandardCharsets.UTF_8)` kullanılıyor.
- Eski MySQL parolası ve JWT anahtarı git geçmişinde kaldı, ikisi de değiştirildi.
- Öğrendiklerim: `${DEĞİŞKEN:varsayılan}` yazımı, Spring profilleri, `@Value`, hata log'unda en alttaki `Caused by:` satırına bakmak, `ERR_CONNECTION_REFUSED` hatasının "backend çalışmıyor" demek olması.

### Adım 2: Rol sistemi (commit `ce49415`)

- `entity/Role.java`: `enum Role { DIETITIAN, CLIENT }`
- `User` entity'sinde `@Enumerated(EnumType.STRING) private Role role = Role.CLIENT;`. Kayıt olan herkes `CLIENT` olur. Diyetisyen rolü şimdilik veritabanından elle veriliyor.
- `JwtService.generateToken(User user)` token'a `role` claim'i ekliyor. `parseClaims(token)` token'ı tek seferde doğrulayıp çözüyor (eski `extractUsername` ve `isTokenValid` kaldırıldı).
- `JwtAuthFilter`, rolü `ROLE_<rol>` yetkisine çeviriyor. Bozuk veya süresi dolmuş token gelirse kullanıcıyı tanımadan devam ediyor. `role` claim'i olmayan eski token'lar kabul edilmiyor.
- `SecurityConfig`: `@EnableMethodSecurity` eklendi. Tanınmayan kullanıcıya 401 dönüyor (`HttpStatusEntryPoint`). `/error` adresi `permitAll`. Bunun sebebi: `JwtAuthFilter` Spring'in iç hata yönlendirmesinde çalışmıyor ve `/error` korumalı olursa 403 yanıtları 401'e dönüşüyordu.
- `UserController` sınıfının tamamı `@PreAuthorize("hasRole('DIETITIAN')")` ile yalnızca diyetisyene açık.
- `GlobalExceptionHandler`, `AccessDeniedException` için `{"status":403,"message":"Bu işlem için yetkiniz yok"}` döndürüyor.
- `LoginResponse` ve `UserResponse` artık `role` alanı içeriyor.
- Mevcut kullanıcıların rolleri Workbench'te elle verildi (`UPDATE app_user SET role = ...`, önce `SET SQL_SAFE_UPDATES = 0`). Benim hesabım `DIETITIAN`.
- Testler: token yok → 401, bozuk token → 401, danışan `/users` → 403, danışan `/tasks` → 200, diyetisyen `/users` → 200.
- Öğrendiklerim: authentication ve authorization farkı, `ROLE_` öneki, 401 ve 403 farkı, JWT'nin şifreli değil yalnızca imzalı olması (içine gizli bilgi konmaz), rol token'da olduğu için rol değişikliğinin ancak yeniden girişte etkili olması.

## 6. Şu an neredeyiz: Adım 3 (Flyway), henüz başlanmadı

Adım 3'ün sade anlatımı bana verildi ama ben henüz koda başlamadım. `pom.xml` ve `application.properties` değişmedi, `ddl-auto` hâlâ `update`.

Adım 3 iki parça:

### 3A: Flyway kurulumu

1. `pom.xml` içine iki bağımlılık (sürüm yazmadan, Spring Boot parent yönetiyor; Flyway 12.4.0 gelecek):
   - `org.springframework.boot:spring-boot-starter-flyway`
   - `org.flywaydb:flyway-mysql`
2. `project/src/main/resources/db/migration/V1__init_schema.sql`: mevcut şemanın SQL karşılığı:
   - `app_user`: `id BIGINT AUTO_INCREMENT PK`, `username`, `email`, `password` (`VARCHAR(255)`), `role ENUM('CLIENT','DIETITIAN')`
   - `task`: `id BIGINT AUTO_INCREMENT PK`, `title VARCHAR(255)`, `is_completed BIT NOT NULL`, `created_at DATETIME(6)`, `user_id BIGINT` + `app_user(id)` foreign key
3. `application.properties`:
   ```properties
   spring.jpa.hibernate.ddl-auto=validate
   spring.flyway.baseline-on-migrate=true
   spring.flyway.baseline-version=1
   ```
   Mevcut veritabanı V1 olarak baseline'lanacak, V1 yalnızca boş veritabanlarında çalışacak.
4. Kontrol: konsolda `Successfully baselined schema with version: 1`, Workbench'te `flyway_schema_history` tablosunda `BASELINE` satırı.
5. İsteğe bağlı deneme: `User` sınıfına geçici `phone` alanı ekleyip `validate` hatasını görmek.
6. İsteğe bağlı test: boş bir `task_manager_fresh` veritabanı oluşturup `DB_URL` ortam değişkeniyle V1'in çalıştığını görmek, sonra silmek.

### 3B: İlk gerçek migration (V2)

- `email` ve `username` sütunlarına `UNIQUE` kısıtı. Şu an aynı e-postayla iki kez kayıt olunabiliyor ve bu durumda `findByEmail` hata verir. Kısıtı eklemeden önce veritabanında tekrar eden kayıt var mı diye kontrol edilmeli.
- `role` sütununu `NOT NULL DEFAULT 'CLIENT'` yapmak.
- `GlobalExceptionHandler` içindeki `DataIntegrityViolationException` mesajı yanlış ("Bu kullanıcıya ait task'lar olduğu için silinemez"). Tekrarlanan e-posta ile kayıt da bu hatayı tetikleyecek. Mesaj düzeltilmeli.

## 7. Sonraki altyapı adımları

4. **Frontend API katmanı:** `http://localhost:8080` her `services/*.ts` dosyasında ayrı yazılı. `.env` (`VITE_API_URL`) ve tek bir fetch yardımcısı. 401 gelince otomatik çıkış ve login'e yönlendirme, 403 gelince "yetkiniz yok" mesajı. Rolü saklayıp diyetisyene ve danışana farklı ekran göstermek.
5. **Docker Compose:** MySQL + backend + frontend tek komutla. Boş veritabanında Flyway'in V1'den itibaren çalıştığı burada da doğrulanacak.
6. **Mobil:** Muhtemelen React Native (Expo), çünkü React/TypeScript bilgimi kullanabilirim. Karar verilmedi.

Sonra **diyetisyen özellikleri**: randevular, diyet planları, ölçüm ve kilo takibi, danışan davet akışı, mesajlaşma gibi. Hangi özelliğin gerçekten gerektiği eşime sorularak belirlenecek.

## 8. Bilinen sorunlar ve borçlar

- `TaskServiceTwo` deneme amaçlı bir sınıf, işe yarar bir şey yapmıyor. `TaskController`, `@Qualifier("taskService")` ile gerçek servisi seçiyor. Silinebilir.
- `ProjectApplicationTests` uygulamanın tamamını açtığı için veritabanına ve `local` profiline ihtiyaç duyuyor. Test yapılandırması ileride düzenlenecek.
- MySQL'de `role` sütunu gerçek bir `ENUM` tipi. Yeni bir rol eklemek bir migration gerektirecek.
- DevTools açıkken işlenmemiş hatalarda yanıtın içinde stack trace görünüyor. 403 için düzeltildi, diğer hatalar için henüz düzeltilmedi.
- Frontend'deki bazı hata mesajları servis dosyalarına Türkçe olarak sabit yazılmış, i18n kullanmıyor.
- `ProtectedRoute` yalnızca `localStorage` içinde token olup olmadığına bakıyor, token'ın süresinin dolup dolmadığına bakmıyor.
- `CLAUDE.md` dosyasında "Schema is managed by `ddl-auto=update`; there are no migrations" yazıyor. Adım 3 bitince güncellenmeli.
