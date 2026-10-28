// Diyetisyenin davet linkleri. Backend: InviteCreateRequest / InviteResponse.

export type InviteCreateRequest = {
    // Paket süresi: 1, 3 veya 6 ay
    months: number
    // Kimin için (ör. "Ayşe Y."); boş bırakılabilir
    note: string | null
}

export type Invite = {
    id: number
    token: string
    note: string | null
    months: number
    createdAt: string
    expiresAt: string
}
