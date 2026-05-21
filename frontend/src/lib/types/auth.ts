export interface AuthUser {
  id: string
  email: string
  name: string
  roles: string[]
  permissions: string[]
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone?: string
}
