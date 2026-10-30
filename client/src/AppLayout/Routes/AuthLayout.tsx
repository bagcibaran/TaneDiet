import type { ReactNode } from 'react'

import Logo from '../../components/Logo'
import LanguageToggle from '../../components/LanguageToggle'
import { HeroBlobs } from '../../components/PageLayout'

type AuthLayoutProps = {
    children: ReactNode
    // Uzun metinler (gizlilik, açık rıza) için daha geniş kart
    wide?: boolean
}

// Giriş ve kayıt sayfalarının çerçevesi: yeşil başlık, büyük logo, altta form kartı
function AuthLayout({ children, wide = false }: AuthLayoutProps) {
    const widthClass = wide ? 'max-w-2xl' : 'max-w-md'
    return (
        <main className="min-h-screen bg-cream">
            <div className="relative rounded-b-[2.25rem] bg-linear-160 from-brand-deep via-brand to-brand-light px-5 pb-20 pt-8">
                <HeroBlobs />
                <div className={`relative mx-auto flex ${widthClass} animate-rise items-start justify-between`}>
                    <Logo size="lg" to="/" />
                    <LanguageToggle />
                </div>
            </div>

            <div className={`relative mx-auto -mt-12 ${widthClass} animate-rise px-4 pb-10 [animation-delay:0.1s]`}>
                <section className="rounded-3xl bg-card p-6 shadow-soft">{children}</section>
            </div>
        </main>
    )
}

export default AuthLayout