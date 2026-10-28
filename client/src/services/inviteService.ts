import type { Invite, InviteCreateRequest } from '../types/invite'
import { apiRequest } from './apiClient'

// Diyetisyen: ödeme yapan kişi için davet linki (tek kullanımlık, 7 gün geçerli)
export function createInvite(request: InviteCreateRequest): Promise<Invite> {
    return apiRequest<Invite>('/invites', { method: 'POST', body: request })
}

// Açık davetler (kullanılmamış, süresi dolmamış), en yeni önce
export function getOpenInvites(): Promise<Invite[]> {
    return apiRequest<Invite[]>('/invites')
}

export function deleteInvite(id: number): Promise<void> {
    return apiRequest<void>(`/invites/${id}`, { method: 'DELETE' })
}

// Danışana gönderilecek link (bu sitenin adresiyle)
export function inviteLink(token: string): string {
    return `${window.location.origin}/register?invite=${token}`
}
