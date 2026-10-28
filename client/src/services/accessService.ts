import type { ClientAccess, ClientAccessRequest } from '../types/access'
import { apiRequest } from './apiClient'

// Diyetisyen: danışanın hizmet süresi
export function getClientAccess(clientId: number): Promise<ClientAccess> {
    return apiRequest<ClientAccess>(`/clients/${clientId}/access`)
}

export function updateClientAccess(clientId: number, request: ClientAccessRequest): Promise<ClientAccess> {
    return apiRequest<ClientAccess>(`/clients/${clientId}/access`, { method: 'PUT', body: request })
}
