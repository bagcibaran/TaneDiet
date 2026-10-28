import type { IntakeForm, IntakeFormRequest } from '../types/intake'
import { apiRequest } from './apiClient'

// Form henüz doldurulmadıysa backend 204 döner → undefined
export function getMyIntake(): Promise<IntakeForm | undefined> {
    return apiRequest<IntakeForm | undefined>('/intake')
}

export function saveMyIntake(request: IntakeFormRequest): Promise<IntakeForm> {
    return apiRequest<IntakeForm>('/intake', {
        method: 'PUT',
        body: request,
    })
}

// Diyetisyen: bir danışanın formu (doldurulmadıysa undefined)
export function getClientIntake(clientId: number): Promise<IntakeForm | undefined> {
    return apiRequest<IntakeForm | undefined>(`/clients/${clientId}/intake`)
}
