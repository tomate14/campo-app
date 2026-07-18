import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import type { AuthResponse, AuthUser } from '../types/auth'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'auth_user'

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return null
    }

    return window.localStorage.getItem(key)
  }

  return SecureStore.getItemAsync(key)
}

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value)
    }
    return
  }

  await SecureStore.setItemAsync(key, value)
}

async function removeItem(key: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
    return
  }

  await SecureStore.deleteItemAsync(key)
}

export async function readAccessToken() {
  return getItem(ACCESS_TOKEN_KEY)
}

export async function readRefreshToken() {
  return getItem(REFRESH_TOKEN_KEY)
}

export async function readCurrentUser(): Promise<AuthUser | null> {
  const raw = await getItem(USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export async function persistSession(session: AuthResponse) {
  await Promise.all([
    setItem(ACCESS_TOKEN_KEY, session.accessToken),
    setItem(REFRESH_TOKEN_KEY, session.refreshToken),
    setItem(USER_KEY, JSON.stringify(session.user)),
  ])
}

// Guarda solo el access token renovado via /auth/refresh (el refresh token no rota).
export async function persistAccessToken(accessToken: string) {
  await setItem(ACCESS_TOKEN_KEY, accessToken)
}

export async function clearSession() {
  await Promise.all([
    removeItem(ACCESS_TOKEN_KEY),
    removeItem(REFRESH_TOKEN_KEY),
    removeItem(USER_KEY),
  ])
}
