// KVKK: danışan verilerinin dışa aktarılması ve erişim kaydı. Backend: ClientExportResponse, AccessLogResponse.

import type { UserResponse } from './auth'
import type { DietPlan } from './diet'
import type { IntakeForm } from './intake'
import type { WeightEntry } from './weight'

// VIEW_INTAKE: ön görüşme formu görüntülendi · EXPORT: veriler dışa aktarıldı
export type AccessLogEntry = {
    action: 'VIEW_INTAKE' | 'EXPORT'
    viewer: string
    createdAt: string
}

export type ConsentRecord = {
    version: string
    acceptedAt: string
}

export type ClientExport = {
    client: UserResponse
    // Hizmetin son günü; null = süresiz
    accessUntil: string | null
    // Form doldurulmadıysa null
    intake: IntakeForm | null
    consents: ConsentRecord[]
    weights: WeightEntry[]
    plans: DietPlan[]
    // En yeni önce; bu dışa aktarmanın kendisi de listede
    accessLog: AccessLogEntry[]
    exportedAt: string
}
