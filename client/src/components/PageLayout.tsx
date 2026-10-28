import type { ReactNode } from 'react'

import Logo from './Logo'
import UserMenu from './UserMenu'

type HeroProps = {
    children?: ReactNode
}

type BodyProps = {
    children?: ReactNode
}

// Yeşil başlıkların arkasında yavaşça yüzen yuvarlak şekiller (yalnızca süs).
// Taşan kısım burada kırpılır; başlığın kendisi kırpmaz, yoksa kullanıcı menüsünün açılır kutusu kesilirdi.
export function HeroBlobs() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[inherit]">
            <span className="absolute -right-12 -top-10 h-44 w-44 animate-floaty rounded-full bg-mint/20" />
            <span className="absolute -left-6 bottom-4 h-20 w-20 animate-floaty rounded-full bg-mint/15 [animation-delay:-3s]" />
        </div>
    )
}

// Sayfanın üstündeki yeşil alan. Telefonda logo ve kullanıcı menüsü burada; bilgisayarda üst menü bu alanın üstüne biner (sm:pt-24 ona yer açar).
export function PageHero({ children }: HeroProps) {
    return (
        <div className="relative rounded-b-[2.25rem] bg-linear-160 from-brand-deep via-brand to-brand-light px-5 pb-16 pt-6 text-cream sm:pt-24">
            <HeroBlobs />
            <div className="relative mx-auto max-w-5xl">
                <div className="flex items-center justify-between sm:hidden">
                    <Logo />
                    <UserMenu />
                </div>
                {children && <div className="mt-5 animate-rise sm:mt-0">{children}</div>}
            </div>
        </div>
    )
}

// Yeşil alanın altındaki içerik. -mt-10 ile kartlar yeşil alanın üstüne biner; kartlar sırayla kayarak gelir.
export function PageBody({ children }: BodyProps) {
    return <div className="stagger relative mx-auto -mt-10 max-w-5xl px-4">{children}</div>
}
