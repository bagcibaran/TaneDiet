import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'

import { PageBody, PageHero } from '../components/PageLayout'
import LanguageToggle from '../components/LanguageToggle'
import { clearSession, getRole, getUsername } from '../services/session'

function ProfilePage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const role = getRole()

    const handleLogout = () => {
        clearSession()
        navigate('/login')
    }

    return (
        <>
            <PageHero aside={<LanguageToggle />}>
                <p className="text-sm text-mint">{t('nav.profile')}</p>
                <h1 className="text-3xl font-extrabold tracking-tight">{getUsername()}</h1>
                {role && (
                    <span className="mt-2 inline-block rounded-full bg-cream/15 px-3 py-1 text-xs font-semibold text-mint">
                        {t(`roles.${role}`)}
                    </span>
                )}
            </PageHero>

            <PageBody>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-card px-4 py-3 font-semibold text-red-700 shadow-sm hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4" />
                    {t('dashboard.logout')}
                </button>
            </PageBody>
        </>
    )
}

export default ProfilePage