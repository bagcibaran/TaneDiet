package com.project.project.legal;

// KVKK metinleri: aydınlatma metni ve açık rıza metni. Asıl kopya burası; ön yüz bunları /legal/** üzerinden okur.
//
// ÖNEMLİ:
//  - Bunlar TASLAKTIR. Yayına almadan önce bir avukat ya da KVKK danışmanı tarafından gözden geçirilmeli.
//  - [ADRES] ve [E-POSTA] yer tutucularını diyetisyen doldurur.
//  - Açık rıza metni değişirse CONSENT_VERSION güncellenmeli: danışanlar bir sonraki girişte yeni metni onaylar.
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

    public static final String CONSENT_VERSION = "2026-10-30";

    public static final String CONSENT_TEXT = """
            ## Açık Rıza Metni

            Bu metin taslaktır; yayına alınmadan önce hukuki olarak gözden geçirilecektir.

            Ön görüşme formunda paylaştığım sağlık bilgilerimin (hastalıklar, ameliyatlar, kullandığım ilaç ve takviyeler, alerjiler, sindirim şikayetleri ve benzerleri) ile kilo kayıtlarımın, bana beslenme danışmanlığı hizmeti verilmesi, diyet programımın hazırlanması ve ilerlememin takip edilmesi amacıyla Dyt. Betül Bağcı tarafından işlenmesine ve hizmet bittikten sonra 2 yıl saklanmasına açık rıza veriyorum.

            Aydınlatma metnini okuduğumu, rızamı istediğim zaman geri alabileceğimi ve bilgilerimin silinmesini isteyebileceğimi biliyorum. Rızamı geri alırsam hizmetin bu bilgiler olmadan sürdürülemeyebileceğini anlıyorum.
            """;

    private LegalTexts() {
    }
}
