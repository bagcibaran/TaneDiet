import { useTranslation } from 'react-i18next'
import { MessageCircle } from 'lucide-react'

import { whatsappContactLink } from '../../utils/whatsapp'

// Sağ altta hep görünen yuvarlak WhatsApp düğmesi
function FloatingWhatsApp() {
    const { t } = useTranslation()

    return (
        <a
            href={whatsappContactLink(t('whatsapp.ask'))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('whatsapp.contact')}
            className="fixed bottom-4 right-4 z-40 flex h-14 w-14 animate-pulse-ring items-center justify-center rounded-full bg-whatsapp text-whatsapp-ink shadow-float transition hover:scale-105"
        >
            <MessageCircle className="h-7 w-7" />
        </a>
    )
}

export default FloatingWhatsApp
