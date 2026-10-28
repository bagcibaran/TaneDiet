import { MessageCircle } from 'lucide-react'

import { whatsappContactLink } from '../utils/whatsapp'

type WhatsAppButtonProps = {
    // Sohbete hazır yazılan mesaj
    text: string
    label: string
    size?: 'lg' | 'md'
    // Dikkat çekmek için nabız gibi atan halka
    pulse?: boolean
}

// Diyetisyene WhatsApp'tan yazma düğmesi (yeni sekmede açılır)
function WhatsAppButton({ text, label, size = 'md', pulse = false }: WhatsAppButtonProps) {
    const sizeClass = size === 'lg' ? 'px-6 py-4 text-base' : 'px-4 py-3 text-sm'
    return (
        <a
            href={whatsappContactLink(text)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp font-extrabold text-whatsapp-ink shadow-soft transition hover:brightness-105 active:scale-[0.98] ${sizeClass} ${
                pulse ? 'animate-pulse-ring' : ''
            }`}
        >
            <MessageCircle className="h-5 w-5" />
            {label}
        </a>
    )
}

export default WhatsAppButton
