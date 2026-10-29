import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageBody, PageHero } from '../components/PageLayout'
import DietLibraryManager from '../components/diet/DietLibraryManager'
import { LoadingCards } from '../components/Skeleton'
import { getDietLibrary } from '../services/dietLibraryService'
import { toErrorMessage } from '../services/errorMessage'
import type { DietLibrary } from '../types/dietLibrary'
import { usePageTitle } from '../hooks/usePageTitle'

// Diyetisyenin "Hazırlar" sekmesi: hazır öğünler ve hızlı maddeler
function DietLibraryPage() {
    const { t } = useTranslation()
    usePageTitle(t('nav.library'))

    const [library, setLibrary] = useState<DietLibrary | null>(null)
    // Ham hata saklanır, mesaj ekrana çizilirken çevrilir
    const [error, setError] = useState<unknown>(null)

    useEffect(() => {
        let cancelled = false
        getDietLibrary()
            .then((result) => {
                if (!cancelled) {
                    setLibrary(result)
                }
            })
            .catch((caught) => {
                if (!cancelled) {
                    setError(caught)
                }
            })
        return () => {
            cancelled = true
        }
    }, [])

    return (
        <>
            <PageHero>
                <h1 className="text-3xl font-extrabold tracking-tight">{t('nav.library')}</h1>
                <p className="mt-1 text-sm text-mint">{t('diet.library.pageHint')}</p>
            </PageHero>

            <PageBody>
                {library === null && error === null && (
                    <LoadingCards count={3} label={t('dashboard.loading')} />
                )}
                {error !== null && (
                    <p className="rounded-3xl bg-card p-5 text-danger shadow-soft">
                        {toErrorMessage(error, t, 'diet.library.loadError')}
                    </p>
                )}
                {library && (
                    <div className="pb-6">
                        <DietLibraryManager
                            library={library}
                            onChange={(update) => setLibrary((current) => (current ? update(current) : current))}
                        />
                    </div>
                )}
            </PageBody>
        </>
    )
}

export default DietLibraryPage
