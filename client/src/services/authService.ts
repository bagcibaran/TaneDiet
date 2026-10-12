import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserResponse,
} from '../types/auth'

const API_URL = 'http://localhost:8080'

export async function loginUser(
    request: LoginRequest,
): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const errorResponse = await response.json()
        throw new Error(errorResponse.message)
    }

    return response.json() as Promise<LoginResponse>
}

export async function registerUser(
    request: RegisterRequest,
): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        throw new Error('Kayıt işlemi başarısız')
    }

    return response.json() as Promise<UserResponse>
}