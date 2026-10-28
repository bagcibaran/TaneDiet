// WhatsApp linkleri. Diyetisyenin numarası .env'deki VITE_WHATSAPP_NUMBER (yalnızca rakam, ör. 905xxxxxxxxx).

// Diyetisyene yazmak: sohbet hazır metinle açılır
export function whatsappContactLink(text: string): string {
    const number = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

// Bir metni (ör. davet linki) paylaşmak: kişi seçme ekranı açılır
export function whatsappShareLink(text: string): string {
    return `https://wa.me/?text=${encodeURIComponent(text)}`
}
