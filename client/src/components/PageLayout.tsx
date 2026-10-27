import type { ReactNode } from 'react'

import Logo from './Logo'

type HeroProps = {
    children?: ReactNode
    // Sağ üst köşeye konacak küçük öğe (örneğin dil düğmeleri)
    aside?: ReactNode
}

type BodyProps = {
    children?: ReactNode
}

// Sayfanın üstündeki yeşil alan. Telefonda logo burada, bilgisayarda üst menüde.
export function PageHero({ children, aside }: HeroProps) {
    return (
        <div className="rounded-b-[2rem] bg-brand px-5 pb-14 pt-6 text-cream sm:pt-4">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-start justify-between">
                    <div className="sm:hidden">
                        <Logo />
                    </div>
                    {aside && <div className="ml-auto">{aside}</div>}
                </div>
                {children && <div className="mt-5 sm:mt-2">{children}</div>}
            </div>
        </div>
    )
}

// Yeşil alanın altındaki içerik. -mt-8 ile kartlar yeşil alanın üstüne biraz biner.
export function PageBody({ children }: BodyProps) {
    return <div className="mx-auto -mt-8 max-w-5xl px-4">{children}</div>
}