import type { ReactNode } from 'react'

import Logo from '../../components/Logo'
import LanguageToggle from '../../components/LanguageToggle'

type AuthLayoutProps = {
    children: ReactNode
}

// Giriş ve kayıt sayfalarının çerçevesi: yeşil başlık, büyük logo, altta form kartı
function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <main className="min-h-screen bg-cream">
            <div className="rounded-b-[2rem] bg-brand px-5 pb-20 pt-8">
                <div className="mx-auto flex max-w-md items-start justify-between">
                    <Logo size="lg" />
                    <LanguageToggle />
                </div>
            </div>

            <div className="mx-auto -mt-12 max-w-md px-4 pb-10">
                <section className="rounded-2xl bg-card p-6 shadow-sm">{children}</section>
            </div>
        </main>
    )
}

export default AuthLayout