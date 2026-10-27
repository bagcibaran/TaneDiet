import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import AuthLayout from '../AppLayout/Routes/AuthLayout'
import { errorTextClass, inputClass, labelClass, primaryButtonClass } from '../components/ui'
import { loginUser } from '../services/authService'
import { ApiError } from '../services/apiClient'
import { toErrorMessage } from '../services/errorMessage'
import { saveToken } from '../services/session'

function LoginPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    // Başka bir sayfa bizi buraya bir sebeple gönderdiyse (?reason=...) bunu göster
    const [searchParams] = useSearchParams()
    const reason = searchParams.get('reason')

    return (
        <AuthLayout>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">{t('login.welcome')}</h1>
            <p className="mb-6 mt-1 text-muted">{t('login.subtitle')}</p>

            {reason === 'expired' && (
                <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                    {t('errors.sessionExpired')}
                </p>
            )}

            {reason === 'registered' && (
                <p className="mb-4 rounded-xl bg-mint/40 p-3 text-sm text-brand">
                    {t('login.registered')}
                </p>
            )}

            <form
                className="space-y-4"
                onSubmit={async (event) => {
                    event.preventDefault()
                    setError('')
                    try {
                        const response = await loginUser({ email, password })
                        saveToken(response.token)
                        navigate('/dashboard')
                    } catch (error) {
                        // Backend yanlış e-posta/şifre için 404 döndürüyor
                        if (error instanceof ApiError && error.status === 404) {
                            setError(t('login.invalidCredentials'))
                        } else {
                            setError(toErrorMessage(error, t, 'login.failed'))
                        }
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

                <button type="submit" className={primaryButtonClass}>
                    {t('login.submit')}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
                {t('login.registerPrompt')}{' '}
                <Link to="/register" className="font-semibold text-brand hover:text-brand-dark">
                    {t('login.registerLink')}
                </Link>
            </p>
        </AuthLayout>
    )
}

export default LoginPage