import type { Role } from '../types/auth'

const TOKEN_KEY = 'token'

type TokenPayload = {
    sub: string
    role: Role
    exp: number
}

export function saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

export function clearSession(): void {
    localStorage.removeItem(TOKEN_KEY)
}

// JWT şifreli değil, yalnızca imzalı: ortadaki parça base64url ile kodlanmış JSON.
// Burada okuduğumuz rol yalnızca ekranı düzenlemek için; asıl yetki kontrolü backend'de.
function readPayload(token: string): TokenPayload | null {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        // atob byte'ları verir; TextDecoder bunları UTF-8 olarak okur (ş, ğ gibi harfler bozulmasın)
        const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
        return JSON.parse(new TextDecoder().decode(bytes)) as TokenPayload
    } catch {
        return null
    }
}

export function isLoggedIn(): boolean {
    const token = getToken()
    if (!token) {
        return false
    }

    const payload = readPayload(token)
    // exp saniye cinsinden, Date.now() milisaniye cinsinden
    return payload !== null && payload.exp * 1000 > Date.now()
}

export function getRole(): Role | null {
    const token = getToken()
    return token ? (readPayload(token)?.role ?? null) : null
}

export function getUsername(): string | null {
    const token = getToken()
    return token ? (readPayload(token)?.sub ?? null) : null
}

// Giriş yapmış kullanıcının ana sayfası: diyetisyen için danışan listesi, danışan için ana sayfa
export function homePath(): string {
    return getRole() === 'DIETITIAN' ? '/clients' : '/dashboard'
}
