export type Role = 'DIETITIAN' | 'CLIENT'

export type LoginRequest = {
    email: string
    password: string
}

export type LoginResponse = {
    token: string
    message: string
    role: Role
}

// Kayıt yalnızca diyetisyenin davet linkiyle
export type RegisterRequest = {
    username: string
    email: string
    password: string
    inviteToken: string
}

// Davet linki geçerliyse paket süresi (ay). Backend: InviteLookupResponse
export type InviteLookup = {
    months: number
}

export type UserResponse = {
    id: number
    username: string
    email: string
    role: Role
}
