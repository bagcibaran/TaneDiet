import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../AppLayout/Routes/AuthLayout.tsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loginUser } from '../services/authService'
import { ApiError } from '../services/apiClient'
import { toErrorMessage } from '../services/errorMessage'
import { saveToken } from '../services/session'

function LoginPage() {
    const { t } = useTranslation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const [error, setError] = useState('')
    // Başka bir sayfa bizi buraya bir sebeple gönderdiyse (?reason=...) bunu göster
    const [searchParams] = useSearchParams()
    const reason = searchParams.get('reason')

    return (
        <AuthLayout>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">
                {t('login.welcome')}
            </h1>

            <p className="mb-6 text-slate-500">
                {t('login.subtitle')}
            </p>

            {reason === 'expired' && (
                <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    {t('errors.sessionExpired')}
                </p>
            )}

            {reason === 'registered' && (
                <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                    {t('login.registered')}
                </p>
            )}

            <form
                className="space-y-4"
                onSubmit={async (event) => {
                    event.preventDefault()
                    setError('')
                    try {
                        const response = await loginUser({
                            email,
                            password,
                        })

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
                    <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        {t('login.email')}
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        {t('login.password')}
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                >
                    {t('login.submit')}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                {t('login.registerPrompt')}

                <Link
                    to="/register"
                    className="font-medium text-blue-600 hover:text-blue-700"
                >
                    {t('login.registerLink')}
                </Link>
            </p>
        </AuthLayout>
    )
}

export default LoginPage