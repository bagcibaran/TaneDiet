import type { AccessLogEntry, ClientExport } from '../types/clientData'
import { apiRequest } from './apiClient'

// Diyetisyen (KVKK): danışan hakkında tutulan her şey. Bu çağrı da erişim kaydına yazılır.
export function getClientExport(clientId: number): Promise<ClientExport> {
    return apiRequest<ClientExport>(`/clients/${clientId}/export`)
}

// Kalıcı silme: danışanın kullanıcı adı aynen yazılmalı (yanlışsa 400)
export function deleteClient(clientId: number, confirmUsername: string): Promise<void> {
    return apiRequest<void>(`/clients/${clientId}`, { method: 'DELETE', body: { confirmUsername } })
}

export function getAccessLog(clientId: number): Promise<AccessLogEntry[]> {
    return apiRequest<AccessLogEntry[]>(`/clients/${clientId}/access-log`)
}
