/// <reference types="vite/client" />

// .env dosyasındaki VITE_ ile başlayan değişkenlerin tipleri
interface ImportMetaEnv {
    readonly VITE_API_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
