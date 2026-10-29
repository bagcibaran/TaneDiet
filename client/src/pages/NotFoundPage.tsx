import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Compass } from 'lucide-react'

import AuthLayout from '../AppLayout/Routes/AuthLayout'
import { primaryButtonClass } from '../components/ui'
import { usePageTitle } from '../hooks/usePageTitle'
import { isLoggedIn } from '../services/session'

// Bilinmeyen adres: markalı "sayfa bulunamadı" ve ana sayfaya dönüş
function NotFoundPage() {
    const { t } = useTranslation()
    usePageTitle(t('notFound.title'))
    const loggedIn = isLoggedIn()

    return (
        <AuthLayout>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky text-sky-ink">
                <Compass className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-bold uppercase tracking-widest text-muted">404</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">{t('notFound.title')}</h1>
            <p className="mb-6 mt-2 text-muted">{t('notFound.text')}</p>
            <Link to={loggedIn ? '/dashboard' : '/'} className={`block text-center ${primaryButtonClass}`}>
                {loggedIn ? t('notFound.toApp') : t('notFound.toHome')}
            </Link>
        </AuthLayout>
    )
}

export default NotFoundPage
