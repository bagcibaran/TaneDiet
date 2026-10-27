import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

import { getUsers } from '../services/userService'
import { toErrorMessage } from '../services/errorMessage'
import type { UserResponse } from '../types/auth'

// Yalnızca diyetisyenin göreceği kullanıcı listesi (App.tsx'te allowedRoles ile korunuyor)
function UsersPage() {
    const { t } = useTranslation()

    const [users, setUsers] = useState<UserResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadUsers() {
            try {
                setUsers(await getUsers())
            } catch (error) {
                setError(toErrorMessage(error, t, 'users.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadUsers()
    }, [t])

    return (
        <main className="min-h-screen bg-slate-100 p-8">
            <div className="mx-auto max-w-6xl">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('users.back')}
                </Link>

                <h1 className="mt-4 text-3xl font-bold text-slate-900">
                    {t('users.title')}
                </h1>

                <section className="mt-8 rounded-xl bg-white p-6 shadow">
                    {loading && (
                        <p className="text-slate-500">{t('dashboard.loading')}</p>
                    )}

                    {error && <p className="text-red-600">{error}</p>}

                    {!loading && !error && (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-sm text-slate-500">
                                    <th className="py-2">{t('register.username')}</th>
                                    <th className="py-2">{t('register.email')}</th>
                                    <th className="py-2">{t('users.role')}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100">
                                    <td className="py-2">
                                        {/* Yalnızca danışanlar tıklanabilir; diyetisyenin kilo sayfası yok */}
                                        {user.role === 'CLIENT' ? (
                                            <Link
                                                to={`/clients/${user.id}`}
                                                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                {user.username}
                                            </Link>
                                        ) : (
                                            <span className="text-slate-800">{user.username}</span>
                                        )}
                                    </td>
                                    <td className="py-2 text-slate-600">{user.email}</td>
                                    <td className="py-2 text-slate-600">{t(`roles.${user.role}`)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>
        </main>
    )
}

export default UsersPage
