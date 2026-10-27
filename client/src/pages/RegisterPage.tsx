import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import AuthLayout from '../AppLayout/Routes/AuthLayout'
import { errorTextClass, inputClass, labelClass, primaryButtonClass } from '../components/ui'
import { registerUser } from '../services/authService'
import { toErrorMessage } from '../services/errorMessage'

function RegisterPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError(t('register.passwordMismatch'))
            return
        }

        try {
            await registerUser({ username, email, password })
            navigate('/login?reason=registered')
        } catch (error) {
            // 409 gelirse backend'in mesajı gösterilir: "Bu e-posta adresi zaten kayıtlı" gibi
            setError(toErrorMessage(error, t, 'register.failed'))
        }
    }

    return (
        <AuthLayout>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">{t('register.title')}</h1>
            <p className="mb-6 mt-1 text-muted">{t('register.subtitle')}</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className={labelClass}>{t('register.username')}</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="register-email" className={labelClass}>{t('register.email')}</label>
                    <input
                        id="register-email"
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
                    <label htmlFor="register-password" className={labelClass}>{t('register.password')}</label>
                    <input
                        id="register-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="confirm-password" className={labelClass}>{t('register.confirmPassword')}</label>
                    <input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                        className={inputClass}
                    />
                </div>

                {error && <p className={errorTextClass}>{error}</p>}

                <button type="submit" className={primaryButtonClass}>
                    {t('register.submit')}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
                {t('register.loginPrompt')}{' '}
                <Link to="/login" className="font-semibold text-brand hover:text-brand-dark">
                    {t('register.loginLink')}
                </Link>
            </p>
        </AuthLayout>
    )
}

export default RegisterPage