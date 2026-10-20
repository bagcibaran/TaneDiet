import type { UserResponse } from '../types/auth'
import { apiRequest } from './apiClient'

// Yalnızca DIETITIAN rolü çağırabilir; diğer roller 403 alır
export function getUsers(): Promise<UserResponse[]> {
    return apiRequest<UserResponse[]>('/users')
}
