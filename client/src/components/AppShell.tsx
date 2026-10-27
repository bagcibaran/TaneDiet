import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, User, Users, type LucideIcon } from 'lucide-react'

import Logo from './Logo'
import { getRole } from '../services/session'

type Tab = {
    to: string
    labelKey: string
    icon: LucideIcon
}

// Role göre sekmeler. Yeni bir sayfa eklendiğinde buraya bir satır eklenir.
const CLIENT_TABS: Tab[] = [
    { to: '/dashboard', labelKey: 'nav.home', icon: Home },
    { to: '/profile', labelKey: 'nav.profile', icon: User },
]

const DIETITIAN_TABS: Tab[] = [
    { to: '/clients', labelKey: 'nav.clients', icon: Users },
    { to: '/profile', labelKey: 'nav.profile', icon: User },
]

function AppShell() {
    const { t } = useTranslation()
    const tabs = getRole() === 'DIETITIAN' ? DIETITIAN_TABS : CLIENT_TABS

    return (
        // pb-24: telefonda içerik alttaki sekme çubuğunun arkasında kalmasın
        <div className="min-h-screen pb-24 sm:pb-0">
            {/* Bilgisayar: üstte yatay menü (telefonda gizli) */}
            <header className="hidden bg-brand sm:block">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <Logo />
                    <nav className="flex gap-2">
                        {tabs.map((tab) => (
                            <NavLink
                                key={tab.to}
                                to={tab.to}
                                className={({ isActive }) =>
                                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                                        isActive ? 'bg-cream text-brand' : 'text-mint hover:text-cream'
                                    }`
                                }
                            >
                                {t(tab.labelKey)}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>

            {/* O anki sayfa buraya gelir */}
            <Outlet />

            {/* Telefon: altta sekme çubuğu (bilgisayarda gizli) */}
            <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-card sm:hidden">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            className={({ isActive }) =>
                                `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                                    isActive ? 'font-semibold text-brand' : 'text-muted'
                                }`
                            }
                        >
                            <Icon className="h-5 w-5" />
                            {t(tab.labelKey)}
                        </NavLink>
                    )
                })}
            </nav>
        </div>
    )
}

export default AppShell