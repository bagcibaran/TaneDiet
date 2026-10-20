import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../AppLayout/Routes/AuthLayout'
import { useState, type FormEvent } from 'react'
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
            await registerUser({
                username,
                email,
                password,
            })

            navigate('/login?reason=registered')
        } catch (error) {
            // 409 gelirse backend'in mesajı gösterilir: "Bu e-posta adresi zaten kayıtlı" gibi
            setError(toErrorMessage(error, t, 'register.failed'))
        }
    }

    return (
        <AuthLayout>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">
                {t('register.title')}
            </h1>

            <p className="mb-6 text-slate-500">
                {t('register.subtitle')}
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label
                        htmlFor="username"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        {t('register.username')}
                    </label>

                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                <div>
                    <label
                        htmlFor="register-email"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        {t('register.email')}
                    </label>

                    <input
                        id="register-email"
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
                        htmlFor="register-password"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        {t('register.password')}
                    </label>

                    <input
                        id="register-password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                <div>
                    <label
                        htmlFor="confirm-password"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        {t('register.confirmPassword')}
                    </label>

                    <input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
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
                    {t('register.submit')}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                {t('register.loginPrompt')}{' '}
                <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-700"
                >
                    {t('register.loginLink')}
                </Link>
            </p>
        </AuthLayout>
    )
}

export default RegisterPage