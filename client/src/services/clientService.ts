import type { ClientActivity, ClientOverview } from '../types/client'
import { apiRequest } from './apiClient'

// Diyetisyen: danışan kartları + bildirimler
export function getClients(): Promise<ClientOverview[]> {
    return apiRequest<ClientOverview[]>('/clients')
}

// Danışanın sayfasında neyin yeni olduğu (görüldü yapmaz)
export function getClientActivity(clientId: number): Promise<ClientActivity> {
    return apiRequest<ClientActivity>(`/clients/${clientId}/activity`)
}

// Diyetisyen sayfayı açtı: bildirimler kaybolur
export function markClientReviewed(clientId: number): Promise<void> {
    return apiRequest<void>(`/clients/${clientId}/review`, { method: 'POST' })
}
