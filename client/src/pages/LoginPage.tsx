import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import AuthLayout from '../AppLayout/Routes/AuthLayout'
import WhatsAppButton from '../components/WhatsAppButton'
import { errorTextClass, inputClass, labelClass, primaryButtonClass } from '../components/ui'
import { loginUser } from '../services/authService'
import { ApiError } from '../services/apiClient'
import { toErrorMessage } from '../services/errorMessage'
import { saveToken } from '../services/session'
import { usePageTitle } from '../hooks/usePageTitle'

function LoginPage() {
    const { t } = useTranslation()
    usePageTitle(t('login.submit'))
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    // Hizmet süresi dolan danışan giriş yapmaya çalıştı (423)
    const [lockedOnLogin, setLockedOnLogin] = useState(false)
    // İstek sürerken düğme kilitli: iki kez basılınca iki istek gitmesin
    const [submitting, setSubmitting] = useState(false)
    // Başka bir sayfa bizi buraya bir sebeple gönderdiyse (?reason=...) bunu göster
    const [searchParams] = useSearchParams()
    const reason = searchParams.get('reason')
    const locked = lockedOnLogin || reason === 'locked'

    return (
        <AuthLayout>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">{t('login.welcome')}</h1>
            <p className="mb-6 mt-1 text-muted">{t('login.subtitle')}</p>

            {reason === 'expired' && (
                <p className="mb-4 rounded-2xl bg-peach p-3 text-sm text-peach-ink">
                    {t('errors.sessionExpired')}
                </p>
            )}

            {/* Hizmet süresi doldu: hesap açık değil, diyetisyene WhatsApp'tan yazsın */}
            {locked && (
                <div className="mb-4 space-y-3 rounded-2xl bg-peach p-4">
                    <p className="font-bold text-ink">{t('login.lockedTitle')}</p>
                    <p className="text-sm text-peach-ink">{t('login.lockedText')}</p>
                    <WhatsAppButton text={t('whatsapp.lockedMessage')} label={t('whatsapp.contact')} />
                </div>
            )}

            {reason === 'registered' && (
                <p className="mb-4 rounded-2xl bg-sage p-3 text-sm text-brand">
                    {t('login.registered')}
                </p>
            )}

            <form
                className="space-y-4"
                onSubmit={async (event) => {
                    event.preventDefault()
                    if (submitting) {
                        return
                    }
                    setError('')
                    setLockedOnLogin(false)
                    setSubmitting(true)
                    try {
                        const response = await loginUser({ email, password })
                        saveToken(response.token)
                        navigate('/dashboard')
                    } catch (error) {
                        // Backend yanlış e-posta/şifre için 404 döndürüyor
                        if (error instanceof ApiError && error.status === 404) {
                            setError(t('login.invalidCredentials'))
                        } else if (error instanceof ApiError && error.status === 423) {
                            setLockedOnLogin(true)
                        } else {
                            setError(toErrorMessage(error, t, 'login.failed'))
                        }
                    } finally {
                        setSubmitting(false)
                    }
                }}
            >
                <div>
                    <label htmlFor="email" className={labelClass}>{t('login.email')}</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="password" className={labelClass}>{t('login.password')}</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className={inputClass}
                    />
                </div>

                {error && <p className={errorTextClass}>{error}</p>}

                <button type="submit" disabled={submitting} className={primaryButtonClass}>
                    {submitting ? t('login.submitting') : t('login.submit')}
                </button>
            </form>

            {/* Kayıt yalnızca davetle: hizmet almak isteyen diyetisyene yazar */}
            <p className="mt-6 text-center text-sm text-muted">{t('login.noAccount')}</p>
        </AuthLayout>
    )
}

export default LoginPage