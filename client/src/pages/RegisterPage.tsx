import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'

import AuthLayout from '../AppLayout/Routes/AuthLayout'
import WhatsAppButton from '../components/WhatsAppButton'
import { errorTextClass, inputClass, labelClass, primaryButtonClass } from '../components/ui'
import { lookupInvite, registerUser } from '../services/authService'
import { toErrorMessage } from '../services/errorMessage'
import { usePageTitle } from '../hooks/usePageTitle'

// Kayıt yalnızca diyetisyenin gönderdiği davet linkiyle: /register?invite=<token>
function RegisterPage() {
    const { t } = useTranslation()
    usePageTitle(t('register.title'))
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const inviteToken = searchParams.get('invite') ?? ''

    // Davet kontrolünün sonucu, hangi token için olduğuyla birlikte (adres değişince eski sonuç kullanılmaz)
    const [lookup, setLookup] = useState<{ token: string; months: number } | null>(null)
    // null = kontrol ediliyor, 0 = geçersiz/yok, diğerleri = paket süresi (ay)
    const inviteMonths = inviteToken === '' ? 0 : lookup?.token === inviteToken ? lookup.months : null
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    // İstek sürerken düğme kilitli: iki kez basılınca iki istek gitmesin
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (inviteToken === '') {
            return
        }
        let cancelled = false
        lookupInvite(inviteToken)
            .then((invite) => {
                if (!cancelled) {
                    setLookup({ token: inviteToken, months: invite.months })
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setLookup({ token: inviteToken, months: 0 })
                }
            })
        return () => {
            cancelled = true
        }
    }, [inviteToken])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (submitting) {
            return
        }
        setError('')

        if (password.length < 8) {
            setError(t('register.passwordTooShort'))
            return
        }

        if (password !== confirmPassword) {
            setError(t('register.passwordMismatch'))
            return
        }

        setSubmitting(true)
        try {
            await registerUser({ username, email, password, inviteToken })
            navigate('/login?reason=registered')
        } catch (error) {
            // 409 gelirse backend'in mesajı gösterilir: "Bu e-posta adresi zaten kayıtlı" gibi
            setError(toErrorMessage(error, t, 'register.failed'))
        } finally {
            setSubmitting(false)
        }
    }

    if (inviteMonths === null) {
        return (
            <AuthLayout>
                <p className="text-muted">{t('register.checkingInvite')}</p>
            </AuthLayout>
        )
    }

    // Davet yok, kullanılmış veya süresi dolmuş: form yerine WhatsApp
    if (inviteMonths === 0) {
        return (
            <AuthLayout>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-peach text-peach-ink">
                    <Lock className="h-6 w-6" />
                </span>
                <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">{t('register.inviteOnlyTitle')}</h1>
                <p className="mb-6 mt-2 text-muted">{t('register.inviteOnlyText')}</p>
                <WhatsAppButton text={t('whatsapp.ask')} label={t('whatsapp.contact')} />
                <p className="mt-6 text-center text-sm text-muted">
                    {t('register.loginPrompt')}{' '}
                    <Link to="/login" className="font-semibold text-brand hover:text-brand-dark">
                        {t('register.loginLink')}
                    </Link>
                </p>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">{t('register.title')}</h1>
            <p className="mt-1 text-muted">{t('register.subtitle')}</p>
            <p className="mb-6 mt-3 inline-block rounded-full bg-sage px-3 py-1 text-sm font-semibold text-brand">
                {t('register.packageLine', { months: inviteMonths })}
            </p>

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
                        minLength={8}
                        maxLength={72}
                        aria-describedby="password-hint"
                        className={inputClass}
                    />
                    <p id="password-hint" className="mt-1 text-xs text-muted">{t('register.passwordHint')}</p>
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

                <button type="submit" disabled={submitting} className={primaryButtonClass}>
                    {submitting ? t('register.submitting') : t('register.submit')}
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
