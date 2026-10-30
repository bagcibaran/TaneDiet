import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ClipboardList, Globe, LogOut, ShieldCheck } from 'lucide-react'

import LanguageToggle from './LanguageToggle'
import { clearSession, getRole, getUsername } from '../services/session'

// Sağ üstteki yuvarlak baş harf düğmesi. Tıklayınca: kullanıcı adı, dil, (danışansa) ön görüşme formu, gizlilik, çıkış.
function UserMenu() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const username = getUsername() ?? ''
    const role = getRole()

    // Menü açıkken dışarı tıklanırsa ya da Esc'e basılırsa kapanır
    useEffect(() => {
        if (!open) {
            return
        }
        const handleClick = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        document.addEventListener('keydown', handleKey)
        return () => {
            document.removeEventListener('mousedown', handleClick)
            document.removeEventListener('keydown', handleKey)
        }
    }, [open])

    const handleLogout = () => {
        clearSession()
        navigate('/login')
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={t('userMenu.open')}
                aria-expanded={open}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-honey font-bold text-ink ring-2 ring-white/30 transition hover:scale-105 hover:ring-cream"
            >
                {username.charAt(0).toLocaleUpperCase('tr')}
            </button>

            {open && (
                <div className="absolute right-0 top-12 z-50 w-64 origin-top-right animate-pop rounded-3xl bg-card p-2 text-ink shadow-float ring-1 ring-line">
                    <div className="px-3 py-2">
                        <p className="truncate font-semibold">{username}</p>
                        {role && <p className="text-xs text-muted">{t(`roles.${role}`)}</p>}
                    </div>

                    <div className="flex items-center justify-between border-t border-line px-3 py-2">
                        <span className="flex items-center gap-2 text-sm text-muted">
                            <Globe className="h-4 w-4" />
                            {t('profile.language')}
                        </span>
                        <LanguageToggle tone="light" />
                    </div>

                    {/* Danışan ön görüşme formunu buradan güncelleyebilir */}
                    {role === 'CLIENT' && (
                        <Link
                            to="/intake"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-cream"
                        >
                            <ClipboardList className="h-4 w-4 text-brand" />
                            {t('intake.profileLink')}
                        </Link>
                    )}

                    <Link
                        to="/gizlilik"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-cream"
                    >
                        <ShieldCheck className="h-4 w-4 text-brand" />
                        {t('privacy.link')}
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-danger hover:bg-danger-soft"
                    >
                        <LogOut className="h-4 w-4" />
                        {t('dashboard.logout')}
                    </button>
                </div>
            )}
        </div>
    )
}

export default UserMenu
