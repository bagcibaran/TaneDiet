import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

import Logo from '../Logo'
import LanguageToggle from '../LanguageToggle'
import WhatsAppButton from '../WhatsAppButton'
import { DietitianPhotoCard } from './DietitianAvatar'
import { HeroBlobs } from '../PageLayout'
import { isLoggedIn } from '../../services/session'

// Sayfanın girişi: logo, diyetisyenin büyük fotoğrafı (güven için ilk bakışta yüz), kısa slogan, büyük WhatsApp düğmesi.
// Telefonda fotoğraf üstte, bilgisayarda sağda. Kayıt düğmesi yok.
function LandingHero() {
    const { t } = useTranslation()
    const loggedIn = isLoggedIn()

    return (
        <header className="relative rounded-b-[2.25rem] bg-linear-160 from-brand-deep via-brand to-brand-light px-5 pb-9 pt-6 text-cream">
            <HeroBlobs />
            <div className="relative mx-auto max-w-4xl">
                <div className="flex items-center justify-between gap-3 animate-rise">
                    <Logo to="/" />
                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        {/* Giriş yapmışsa uygulamaya, değilse giriş sayfasına */}
                        <Link
                            to={loggedIn ? '/dashboard' : '/login'}
                            className="whitespace-nowrap rounded-full border border-white/40 px-3 py-1.5 text-xs font-bold transition hover:bg-white/10"
                        >
                            {loggedIn ? t('landing.goToApp') : t('landing.clientLogin')}
                        </Link>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 sm:mt-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] sm:items-center sm:gap-10">
                    <div className="animate-rise [animation-delay:0.05s] sm:order-2">
                        <DietitianPhotoCard />
                    </div>

                    <div className="sm:order-1">
                        <h1 className="animate-rise text-[2rem] font-extrabold leading-[1.08] tracking-tight [animation-delay:0.1s] sm:text-5xl">
                            <Trans i18nKey="landing.headline" components={{ em: <span className="text-honey" />, br: <br /> }} />
                        </h1>
                        <p className="mt-3 animate-rise text-cream/90 [animation-delay:0.15s] sm:text-lg">{t('landing.subtitle')}</p>

                        <div className="mt-6 animate-rise [animation-delay:0.2s] sm:max-w-sm">
                            <WhatsAppButton text={t('whatsapp.ask')} label={t('landing.whatsappCta')} size="lg" pulse />
                        </div>

                        <ul className="mt-4 flex flex-wrap gap-2 animate-rise [animation-delay:0.25s]">
                            {['chip1', 'chip2', 'chip3'].map((key) => (
                                <li key={key} className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                                    <Check className="h-3.5 w-3.5" />
                                    {t(`landing.${key}`)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default LandingHero
