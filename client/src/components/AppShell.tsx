import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookMarked, Home, Users, UtensilsCrossed, type LucideIcon } from 'lucide-react'

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
    { to: '/library', labelKey: 'nav.library', icon: BookMarked },
]

function AppShell() {
    const { t } = useTranslation()
    const tabs = getRole() === 'DIETITIAN' ? DIETITIAN_TABS : CLIENT_TABS
    // Tek sekme varsa (diyetisyen) alt çubuğa gerek yok
    const showBottomBar = tabs.length > 1

    return (
        // pb-28: telefonda içerik yüzen alt menünün arkasında kalmasın
        <div className={`relative min-h-screen sm:pb-8 ${showBottomBar ? 'pb-28' : 'pb-8'}`}>
            {/* Bilgisayar: hap şeklinde sekmeler, sayfanın yeşil başlığının üstünde şeffaf durur (tek parça görünsün diye; telefonda gizli) */}
            <header className="absolute inset-x-0 top-0 z-30 hidden sm:block">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <Logo />
                    <div className="flex items-center gap-3">
                        <nav className="flex gap-1 rounded-full bg-black/15 p-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <NavLink
                                        key={tab.to}
                                        to={tab.to}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                isActive ? 'bg-cream text-brand shadow-sm' : 'text-mint hover:text-cream'
                                            }`
                                        }
                                    >
                                        <Icon className="h-4 w-4" />
                                        {t(tab.labelKey)}
                                    </NavLink>
                                )
                            })}
                        </nav>
                        <UserMenu />
                    </div>
                </div>
            </header>

            {/* O anki sayfa buraya gelir */}
            <Outlet />

            {/* Telefon: altta yüzen koyu hap menü (bilgisayarda gizli) */}
            {showBottomBar && (
                <nav className="fixed inset-x-4 bottom-3 z-40 flex gap-1 rounded-full bg-ink/90 p-1.5 shadow-float backdrop-blur-md sm:hidden">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <NavLink
                                key={tab.to}
                                to={tab.to}
                                className={({ isActive }) =>
                                    `flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs transition ${
                                        isActive ? 'animate-pop bg-cream font-bold text-brand' : 'text-mint'
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