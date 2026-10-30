// KVKK metni (backend /legal/privacy ve /legal/consent). Biçim: "## " ile başlayan satır başlık, boş satır paragraf ayırır.
export type LegalText = {
    version: string
    text: string
    // Metnin gerçek dili: "tr" ya da çevirisi ("en"); çeviri yoksa Türkçe gelir
    language: string
}
