package com.project.project.legal;

// KVKK metinleri: aydınlatma metni ve açık rıza metni. Asıl kopya burası; ön yüz bunları /legal/** üzerinden okur.
//
// ÖNEMLİ:
//  - Bunlar TASLAKTIR. Yayına almadan önce bir avukat ya da KVKK danışmanı tarafından gözden geçirilmeli.
//  - [ADRES] ve [E-POSTA] yer tutucularını diyetisyen doldurur.
//  - Açık rıza metni değişirse CONSENT_VERSION güncellenmeli: danışanlar bir sonraki girişte yeni metni onaylar.
//  - *_EN ve *_DE çeviriler yalnızca bilgi amaçlıdır; bağlayıcı olan Türkçe metindir. Türkçe metin değişince çeviriler de güncellenmeli.
//  - Biçim: "## " ile başlayan satır başlıktır, boş satır paragrafları ayırır.
public final class LegalTexts {

    public static final String PRIVACY_VERSION = "2026-10-30";

    public static final String PRIVACY_TEXT = """
            ## Kişisel Verilerin Korunması Hakkında Aydınlatma Metni

            Bu metin taslaktır; yayına alınmadan önce hukuki olarak gözden geçirilecektir.

            ## Veri sorumlusu

            Dyt. Betül Bağcı (şahıs) — tane. online diyet
            Adres: [ADRES]
            E-posta: [E-POSTA]

            ## Hangi verilerini işliyoruz?

            Kimlik ve iletişim bilgilerin (kullanıcı adı, e-posta), ön görüşme formundaki cevapların, kilo kayıtların, sana yazılan diyet programları ve uygulamanın güvenli çalışması için gereken teknik kayıtlar (ör. giriş denemeleri, diyetisyenin bilgilerini ne zaman görüntülediği).

            Ön görüşme formundaki sağlık bilgilerin (hastalıklar, ameliyatlar, ilaçlar, alerjiler, sindirim şikayetleri gibi) KVKK'ya göre özel nitelikli kişisel veridir.

            ## Neden işliyoruz?

            Sana kişiye özel beslenme danışmanlığı vermek, menünü hazırlamak, ilerlemeni takip etmek ve hizmetle ilgili seninle iletişim kurmak için.

            ## Hukuki sebep

            Sağlık bilgilerin yalnızca açık rızana dayanarak işlenir. Diğer bilgilerin, aramızdaki hizmetin kurulması ve yürütülmesi için gerekli olduğundan işlenir.

            ## Kimlerle paylaşıyoruz?

            Bilgilerin üçüncü kişilerle paylaşılmaz ve satılmaz. Uygulamanın barındırıldığı sunucu: [SUNUCU / BARINDIRMA HİZMETİ]. Sunucu yurt dışında olursa bu ayrıca belirtilir ve gerekiyorsa ayrıca onayın istenir.

            ## Ne kadar saklıyoruz?

            Hizmet süren boyunca ve hizmetin bittiği tarihten itibaren 2 yıl. Bu sürenin sonunda bilgilerin otomatik olarak kalıcı biçimde silinir. Daha önce silinmesini istersen yazman yeterli.

            ## Çerezler

            Uygulama reklam ya da takip çerezi kullanmaz. Yalnızca oturumunu açık tutmak ve yarım kalan formunu kaybetmemek için tarayıcının yerel depolamasını kullanır.

            ## Hakların (KVKK madde 11)

            Bilgilerinin işlenip işlenmediğini öğrenme, bilgi isteme, amacını öğrenme, kimlere aktarıldığını bilme, eksik veya yanlışsa düzeltilmesini, silinmesini isteme, itiraz etme ve zarara uğradıysan giderilmesini isteme hakların vardır.

            ## Nasıl başvurursun?

            Bilgilerinin bir kopyasını ya da silinmesini istersen diyetisyenine WhatsApp'tan ya da [E-POSTA] adresinden yazabilirsin. Talebin en geç 30 gün içinde sonuçlandırılır.
            """;

    // İngilizce çeviri: yalnızca bilgi amaçlı, bağlayıcı olan Türkçe metindir. Türkçe metin değişince bu da güncellenmeli.
    public static final String PRIVACY_TEXT_EN = """
            ## Privacy Notice on the Protection of Personal Data

            This text is a draft; it will be reviewed legally before going live. This English version is a translation for information only; the Turkish text is binding.

            ## Data controller

            Dyt. Betül Bağcı (individual) — tane. online diyet
            Address: [ADRES]
            Email: [E-POSTA]

            ## Which data do we process?

            Your identity and contact details (username, email), your answers in the pre-interview form, your weight entries, the diet programs written for you and the technical records needed for the app to run securely (e.g. login attempts, when the dietitian viewed your information).

            The health information in the pre-interview form (illnesses, surgeries, medications, allergies, digestive complaints and the like) is special category personal data under the KVKK (Turkish Personal Data Protection Law).

            ## Why do we process it?

            To give you personalised nutrition counselling, prepare your menu, follow your progress and contact you about the service.

            ## Legal basis

            Your health information is processed only on the basis of your explicit consent. Your other information is processed because it is necessary to set up and run the service between us.

            ## Who do we share it with?

            Your information is not shared with or sold to third parties. Server hosting the app: [SUNUCU / BARINDIRMA HİZMETİ]. If the server is abroad, this will be stated separately and your consent will be asked for where required.

            ## How long do we keep it?

            For as long as your service lasts and for 2 years after it ends. At the end of this period your information is permanently deleted automatically. If you want it deleted earlier, just write to us.

            ## Cookies

            The app does not use advertising or tracking cookies. It only uses the browser's local storage to keep you logged in and to keep an unfinished form.

            ## Your rights (KVKK Article 11)

            You have the right to learn whether your data is processed, to request information, to learn the purpose, to know to whom it is transferred, to ask for it to be corrected if incomplete or wrong, to ask for it to be deleted, to object, and to claim compensation if you suffered damage.

            ## How to apply

            If you want a copy of your information or want it deleted, write to your dietitian on WhatsApp or at [E-POSTA]. Your request will be concluded within 30 days at the latest.
            """;

    // Almanca çeviri: yalnızca bilgi amaçlı, bağlayıcı olan Türkçe metindir. Türkçe metin değişince bu da güncellenmeli.
    public static final String PRIVACY_TEXT_DE = """
            ## Datenschutzhinweis zum Schutz personenbezogener Daten

            Dieser Text ist ein Entwurf; er wird vor der Veröffentlichung rechtlich geprüft. Diese deutsche Fassung ist eine Übersetzung zur Information; verbindlich ist der türkische Text.

            ## Verantwortliche

            Dyt. Betül Bağcı (Einzelperson) — tane. online diyet
            Adresse: [ADRES]
            E-Mail: [E-POSTA]

            ## Welche Daten verarbeiten wir?

            Deine Identitäts- und Kontaktdaten (Benutzername, E-Mail), deine Antworten im Vorgesprächsformular, deine Gewichtseinträge, die für dich erstellten Ernährungspläne sowie technische Aufzeichnungen, die für den sicheren Betrieb der App nötig sind (z. B. Anmeldeversuche, wann die Ernährungsberaterin deine Angaben angesehen hat).

            Die Gesundheitsangaben im Vorgesprächsformular (Erkrankungen, Operationen, Medikamente, Allergien, Verdauungsbeschwerden und Ähnliches) sind nach dem KVKK (türkisches Datenschutzgesetz) besondere Kategorien personenbezogener Daten.

            ## Warum verarbeiten wir sie?

            Um dir eine persönliche Ernährungsberatung zu geben, deinen Plan zu erstellen, deinen Fortschritt zu verfolgen und dich zum Service zu kontaktieren.

            ## Rechtsgrundlage

            Deine Gesundheitsangaben werden nur auf Grundlage deiner ausdrücklichen Einwilligung verarbeitet. Deine übrigen Angaben werden verarbeitet, weil sie für die Einrichtung und Durchführung des Services zwischen uns erforderlich sind.

            ## An wen geben wir sie weiter?

            Deine Daten werden nicht an Dritte weitergegeben oder verkauft. Server, auf dem die App läuft: [SUNUCU / BARINDIRMA HİZMETİ]. Liegt der Server im Ausland, wird dies gesondert angegeben und, falls erforderlich, deine Einwilligung eingeholt.

            ## Wie lange speichern wir sie?

            Während deines Services und 2 Jahre nach dessen Ende. Danach werden deine Daten automatisch dauerhaft gelöscht. Wenn du eine frühere Löschung möchtest, schreib uns einfach.

            ## Cookies

            Die App verwendet keine Werbe- oder Tracking-Cookies. Sie nutzt nur den lokalen Speicher des Browsers, um dich angemeldet zu halten und ein unvollständiges Formular nicht zu verlieren.

            ## Deine Rechte (KVKK Artikel 11)

            Du hast das Recht zu erfahren, ob deine Daten verarbeitet werden, Auskunft zu verlangen, den Zweck zu erfahren, zu wissen, an wen sie übermittelt werden, ihre Berichtigung bei Unvollständigkeit oder Fehlern und ihre Löschung zu verlangen, Widerspruch einzulegen und bei einem Schaden Ersatz zu verlangen.

            ## So stellst du einen Antrag

            Wenn du eine Kopie deiner Daten oder ihre Löschung möchtest, schreib deiner Ernährungsberaterin über WhatsApp oder an [E-POSTA]. Dein Antrag wird spätestens innerhalb von 30 Tagen erledigt.
            """;

    public static final String CONSENT_VERSION = "2026-10-30";

    public static final String CONSENT_TEXT = """
            ## Açık Rıza Metni

            Bu metin taslaktır; yayına alınmadan önce hukuki olarak gözden geçirilecektir.

            Ön görüşme formunda paylaştığım sağlık bilgilerimin (hastalıklar, ameliyatlar, kullandığım ilaç ve takviyeler, alerjiler, sindirim şikayetleri ve benzerleri) ile kilo kayıtlarımın, bana beslenme danışmanlığı hizmeti verilmesi, diyet programımın hazırlanması ve ilerlememin takip edilmesi amacıyla Dyt. Betül Bağcı tarafından işlenmesine ve hizmet bittikten sonra 2 yıl saklanmasına açık rıza veriyorum.

            Aydınlatma metnini okuduğumu, rızamı istediğim zaman geri alabileceğimi ve bilgilerimin silinmesini isteyebileceğimi biliyorum. Rızamı geri alırsam hizmetin bu bilgiler olmadan sürdürülemeyebileceğini anlıyorum.
            """;

    // İngilizce çeviri: yalnızca bilgi amaçlı. Onaylanan sürüm ve metin özeti Türkçe metne aittir.
    public static final String CONSENT_TEXT_EN = """
            ## Explicit Consent Text

            This text is a draft; it will be reviewed legally before going live. This English version is a translation for information only; the Turkish text is binding.

            I give my explicit consent for my health information shared in the pre-interview form (illnesses, surgeries, medications and supplements I use, allergies, digestive complaints and similar) and my weight entries to be processed by Dyt. Betül Bağcı for the purpose of providing me with nutrition counselling, preparing my diet program and following my progress, and to be kept for 2 years after the service ends.

            I know that I have read the privacy notice, that I can withdraw my consent at any time and that I can ask for my information to be deleted. I understand that if I withdraw my consent, the service may not be able to continue without this information.
            """;

    // Almanca çeviri: yalnızca bilgi amaçlı. Onaylanan sürüm ve metin özeti Türkçe metne aittir.
    public static final String CONSENT_TEXT_DE = """
            ## Ausdrückliche Einwilligung

            Dieser Text ist ein Entwurf; er wird vor der Veröffentlichung rechtlich geprüft. Diese deutsche Fassung ist eine Übersetzung zur Information; verbindlich ist der türkische Text.

            Ich willige ausdrücklich ein, dass meine im Vorgesprächsformular angegebenen Gesundheitsdaten (Erkrankungen, Operationen, eingenommene Medikamente und Nahrungsergänzungsmittel, Allergien, Verdauungsbeschwerden und Ähnliches) und meine Gewichtseinträge von Dyt. Betül Bağcı zum Zweck meiner Ernährungsberatung, der Erstellung meines Ernährungsplans und der Verfolgung meines Fortschritts verarbeitet und nach Ende des Services 2 Jahre gespeichert werden.

            Ich bestätige, dass ich den Datenschutzhinweis gelesen habe, und weiß, dass ich meine Einwilligung jederzeit widerrufen und die Löschung meiner Daten verlangen kann. Mir ist bewusst, dass der Service ohne diese Daten möglicherweise nicht fortgeführt werden kann, wenn ich meine Einwilligung widerrufe.
            """;

    // Bu dilde çeviri var mı (İngilizce, Almanca)
    public static boolean hasTranslation(String language) {
        return "en".equals(language) || "de".equals(language);
    }

    // Aydınlatma metni istenen dilde; çevirisi yoksa Türkçe
    public static String privacyText(String language) {
        return switch (language) {
            case "en" -> PRIVACY_TEXT_EN;
            case "de" -> PRIVACY_TEXT_DE;
            default -> PRIVACY_TEXT;
        };
    }

    // Açık rıza metni istenen dilde; çevirisi yoksa Türkçe
    public static String consentText(String language) {
        return switch (language) {
            case "en" -> CONSENT_TEXT_EN;
            case "de" -> CONSENT_TEXT_DE;
            default -> CONSENT_TEXT;
        };
    }

    private LegalTexts() {
    }
}
