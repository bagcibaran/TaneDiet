import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn, MessageCircle } from 'lucide-react'

import Logo from '../Logo'
import { whatsappContactLink } from '../../utils/whatsapp'

// Sayfanın en altı: logo, iletişim, danışan girişi ve telif satırı
function LandingFooter() {
    const { t } = useTranslation()

    return (
        <footer className="mt-10 border-t border-line pb-[calc(6rem+env(safe-area-inset-bottom))] pt-8 sm:pb-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <Logo tone="dark" />
                    <p className="mt-3 max-w-xs text-sm text-muted">{t('landing.footerText')}</p>
                </div>
                <ul className="space-y-2 text-sm font-semibold">
                    <li>
                        <a
                            href={whatsappContactLink(t('whatsapp.ask'))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-brand hover:text-brand-dark"
                        >
                            <MessageCircle className="h-4 w-4" />
                            {t('whatsapp.contact')}
                        </a>
                    </li>
                    <li>
                        <Link to="/login" className="inline-flex items-center gap-2 text-brand hover:text-brand-dark">
                            <LogIn className="h-4 w-4" />
                            {t('landing.clientLogin')}
                        </Link>
                    </li>
                </ul>
            </div>
            <p className="mt-8 text-xs text-muted">© {new Date().getFullYear()} tane. online diyet · Dyt. Betül Bağcı</p>
        </footer>
    )
}

export default LandingFooter
