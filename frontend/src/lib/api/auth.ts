import { apiClient } from './client'
import type { ApiResponse } from '../types/agricola'
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../types/auth'

export async function login(data: LoginRequest) {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
  return response.data.data
}

export async function register(data: RegisterRequest) {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
  return response.data.data
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await apiClient.post<ApiResponse<string>>('/auth/refresh', { refreshToken })
  return response.data.data
}

export async function getCurrentUser() {
  const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me')
  return response.data.data
}

export async function logout() {
  await apiClient.post('/auth/logout')
}
