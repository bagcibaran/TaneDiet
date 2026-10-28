import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import LandingHero from '../components/landing/LandingHero'
import CampaignCard from '../components/landing/CampaignCard'
import AppShowcase from '../components/landing/AppShowcase'
import StartSteps from '../components/landing/StartSteps'
import RecipeRow from '../components/landing/RecipeRow'
import AboutCard from '../components/landing/AboutCard'
import FinalCall from '../components/landing/FinalCall'
import FloatingWhatsApp from '../components/landing/FloatingWhatsApp'

// Başlık + kısa açıklama + içerik; bölümler sırayla kayarak gelir
function Section({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
    return (
        <section className="animate-rise pt-7">
            {title && <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{title}</h2>}
            {subtitle && <p className="mb-3 mt-0.5 text-sm text-muted">{subtitle}</p>}
            {children}
        </section>
    )
}

// Herkese açık sayfa (/): kısa, göz gezdirerek anlaşılır; tek hedef WhatsApp'tan yazmak. Kayıt düğmesi yok.
function LandingPage() {
    const { t } = useTranslation()

    return (
        <main className="min-h-screen bg-cream pb-24">
            <LandingHero />

            <div className="mx-auto max-w-3xl px-5">
                <Section>
                    <CampaignCard />
                </Section>

                <Section title={t('landing.showcaseTitle')} subtitle={t('landing.showcaseText')}>
                    <AppShowcase />
                </Section>

                <Section title={t('landing.stepsTitle')} subtitle={t('landing.stepsText')}>
                    <StartSteps />
                </Section>

                <Section title={t('landing.recipesTitle')} subtitle={t('landing.recipesText')}>
                    <RecipeRow />
                </Section>

                <Section>
                    <AboutCard />
                </Section>

                <Section>
                    <FinalCall />
                </Section>
            </div>

            <FloatingWhatsApp />
        </main>
    )
}

export default LandingPage
