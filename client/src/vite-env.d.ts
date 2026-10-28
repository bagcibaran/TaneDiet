/// <reference types="vite/client" />

// .env dosyasındaki VITE_ ile başlayan değişkenlerin tipleri
interface ImportMetaEnv {
    readonly VITE_API_URL: string
    // Diyetisyenin WhatsApp numarası (yalnızca rakam, ör. 905xxxxxxxxx)
    readonly VITE_WHATSAPP_NUMBER: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
