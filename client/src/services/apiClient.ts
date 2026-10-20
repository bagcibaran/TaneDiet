import { clearSession, getToken } from './session'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
    throw new Error('VITE_API_URL tanımlı değil. client/.env.example dosyasını .env olarak kopyala.')
}

// Backend'in döndürdüğü hatayı taşır. status 0, backend'e hiç ulaşılamadığı anlamına gelir.
export class ApiError extends Error {
    readonly status: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
}

export async function apiRequest<T>(
    path: string,
    { method = 'GET', body }: RequestOptions = {},
): Promise<T> {
    const token = getToken()

    const headers: Record<string, string> = {}
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json'
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    let response: Response
    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        })
    } catch {
        throw new ApiError(0, 'Sunucuya ulaşılamadı')
    }

    // Token gönderdik ama backend tanımadı: süresi dolmuş veya bozuk. Oturumu kapat.
    if (response.status === 401 && token) {
        clearSession()
        window.location.replace('/login?reason=expired')
    }

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new ApiError(response.status, errorBody?.message ?? '')
    }

    // DELETE gibi isteklerde gövde boş gelir; boş metni JSON diye okumaya çalışmayalım
    const text = await response.text()
    return (text ? JSON.parse(text) : undefined) as T
}
