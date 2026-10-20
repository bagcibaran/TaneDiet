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

export type RegisterRequest = {
    username: string
    email: string
    password: string
}

export type UserResponse = {
    id: number
    username: string
    email: string
    role: Role
}
