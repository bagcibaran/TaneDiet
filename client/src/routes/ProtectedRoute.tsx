import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getRole, getToken, isLoggedIn } from '../services/session'
import type { Role } from '../types/auth'

type ProtectedRouteProps = {
    children: ReactNode
    // Verilirse yalnızca bu rollere açılır (örneğin ['DIETITIAN'])
    allowedRoles?: Role[]
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    if (!isLoggedIn()) {
        // Token var ama süresi dolmuş: kullanıcıya nedenini söyle.
        // Token'ı burada silmiyoruz: render sırasında yan etki olmamalı (StrictMode bileşeni iki kez çalıştırır).
        // Eski token zararsız; bir sonraki girişte saveToken üzerine yazar.
        const expired = getToken() !== null
        return <Navigate to={expired ? '/login?reason=expired' : '/login'} replace />
    }

    const role = getRole()
    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default ProtectedRoute
