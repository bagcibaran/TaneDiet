// KVKK metni (backend /legal/privacy ve /legal/consent). Biçim: "## " ile başlayan satır başlık, boş satır paragraf ayırır.
export type LegalText = {
    version: string
    text: string
}
