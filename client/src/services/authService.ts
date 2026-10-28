import type {
    InviteLookup,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserResponse,
} from '../types/auth'
import { apiRequest } from './apiClient'

export function loginUser(request: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: request,
    })
}

export function registerUser(request: RegisterRequest): Promise<UserResponse> {
    return apiRequest<UserResponse>('/auth/register', {
        method: 'POST',
        body: request,
    })
}

// Kayıt sayfası davet linkini kontrol eder (geçersizse 404)
export function lookupInvite(token: string): Promise<InviteLookup> {
    return apiRequest<InviteLookup>(`/auth/invites/${encodeURIComponent(token)}`)
}
