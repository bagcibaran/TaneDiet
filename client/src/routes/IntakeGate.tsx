import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import Logo from '../components/Logo'
import { getMyIntake } from '../services/intakeService'
import { toErrorMessage } from '../services/errorMessage'
import { getRole } from '../services/session'

type IntakeGateProps = {
    children: ReactNode
}

type GateState = 'checking' | 'missing' | 'done' | 'error'

// Ön görüşme formunu doldurmamış danışanı forma gönderir. Diyetisyen hiç beklemeden geçer.
function IntakeGate({ children }: IntakeGateProps) {
    const { t } = useTranslation()
    const isClient = getRole() === 'CLIENT'

    const [state, setState] = useState<GateState>(isClient ? 'checking' : 'done')
    // Ham hata saklanır, mesaj ekrana çizilirken çevrilir
    const [error, setError] = useState<unknown>(null)
    // "Tekrar dene" butonu bu sayıyı artırarak kontrolü yeniden başlatır
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        if (!isClient) {
            return
        }

        let cancelled = false
        getMyIntake()
            .then((form) => {
                if (!cancelled) {
                    setState(form ? 'done' : 'missing')
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setError(error)
                    setState('error')
                }
            })

        // Bileşen kapanırsa geç gelen cevap state'i değiştirmesin
        return () => {
            cancelled = true
        }
        // `t` bilerek yok: dil değişince kontrol tekrar çalışmasın
    }, [isClient, attempt])

    if (state === 'done') {
        return children
    }

    if (state === 'missing') {
        return <Navigate to="/intake" replace />
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand px-6 text-center">
            <Logo size="lg" />
            {state === 'checking' && <p className="text-mint">{t('intake.gate.loading')}</p>}
            {state === 'error' && (
                <div className="w-full max-w-xs space-y-4">
                    <p className="text-cream">{toErrorMessage(error, t, 'intake.gate.error')}</p>
                    <button
                        type="button"
                        onClick={() => {
                            setState('checking')
                            setAttempt((value) => value + 1)
                        }}
                        className="w-full rounded-full bg-cream px-4 py-3 font-semibold text-brand transition hover:bg-card"
                    >
                        {t('intake.gate.retry')}
                    </button>
                </div>
            )}
        </main>
    )
}

export default IntakeGate
