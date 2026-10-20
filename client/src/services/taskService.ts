import type {
    CreateTaskRequest,
    Task,
    UpdateTaskRequest,
} from '../types/task'
import { apiRequest } from './apiClient'

export function getTasks(): Promise<Task[]> {
    return apiRequest<Task[]>('/tasks')
}

export function createTask(request: CreateTaskRequest): Promise<Task> {
    return apiRequest<Task>('/tasks', {
        method: 'POST',
        body: request,
    })
}

export function updateTask(id: number, request: UpdateTaskRequest): Promise<Task> {
    return apiRequest<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: request,
    })
}

export function deleteTask(id: number): Promise<void> {
    return apiRequest<void>(`/tasks/${id}`, {
        method: 'DELETE',
    })
}
