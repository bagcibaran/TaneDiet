import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Users, UtensilsCrossed, type LucideIcon } from 'lucide-react'

import Logo from './Logo'
import UserMenu from './UserMenu'
import { getRole } from '../services/session'

type Tab = {
    to: string
    labelKey: string
    icon: LucideIcon
}

// Role göre sekmeler. Yeni bir sayfa eklendiğinde buraya bir satır eklenir.
const CLIENT_TABS: Tab[] = [
    { to: '/dashboard', labelKey: 'nav.home', icon: Home },
    { to: '/menu', labelKey: 'nav.menu', icon: UtensilsCrossed },
]

const DIETITIAN_TABS: Tab[] = [
    { to: '/clients', labelKey: 'nav.clients', icon: Users },
]

function AppShell() {
    const { t } = useTranslation()
    const tabs = getRole() === 'DIETITIAN' ? DIETITIAN_TABS : CLIENT_TABS
    // Tek sekme varsa (diyetisyen) alt çubuğa gerek yok
    const showBottomBar = tabs.length > 1

    return (
        // pb-24: telefonda içerik alttaki sekme çubuğunun arkasında kalmasın
        <div className={`min-h-screen sm:pb-0 ${showBottomBar ? 'pb-24' : 'pb-8'}`}>
            {/* Bilgisayar: üstte yatay menü (telefonda gizli) */}
            <header className="hidden bg-brand sm:block">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <Logo />
                    <nav className="flex items-center gap-2">
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
                        <div className="ml-2">
                            <UserMenu />
                        </div>
                    </nav>
                </div>
            </header>

            {/* O anki sayfa buraya gelir */}
            <Outlet />

            {/* Telefon: altta sekme çubuğu (bilgisayarda gizli) */}
            {showBottomBar && (
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
            )}
        </div>
    )
}

export default AppShell