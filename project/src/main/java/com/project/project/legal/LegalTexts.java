package com.project.project.legal;

// KVKK metinleri: aydınlatma metni ve açık rıza metni. Asıl kopya burası; ön yüz bunları /legal/** üzerinden okur.
//
// ÖNEMLİ:
//  - Bunlar TASLAKTIR. Yayına almadan önce bir avukat ya da KVKK danışmanı tarafından gözden geçirilmeli.
//  - [ADRES] ve [E-POSTA] yer tutucularını diyetisyen doldurur.
//  - Açık rıza metni değişirse CONSENT_VERSION güncellenmeli: danışanlar bir sonraki girişte yeni metni onaylar.
//  - *_EN çeviriler yalnızca bilgi amaçlıdır; bağlayıcı olan Türkçe metindir. Türkçe metin değişince çeviriler de güncellenmeli.
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

    // Bu dilde çeviri var mı (şimdilik yalnızca İngilizce; Almanca sonra)
    public static boolean hasTranslation(String language) {
        return "en".equals(language);
    }

    private LegalTexts() {
    }
}
