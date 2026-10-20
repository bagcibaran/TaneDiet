import type {
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
