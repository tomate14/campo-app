import axios from 'axios'
import { Platform } from 'react-native'

type TokenProvider = () => string | null | Promise<string | null>

function resolveBaseUrl() {
  return process.env.EXPO_PUBLIC_API_URL ?? (
    Platform.OS === 'android'
      ? 'http://10.0.2.2:8080/api/v1'
      : 'http://localhost:8080/api/v1'
  )
}

let accessTokenProvider: TokenProvider = () => null

export const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
})

export function configureApiClient(options?: {
  baseURL?: string
  getAccessToken?: TokenProvider
}) {
  if (options?.baseURL) {
    apiClient.defaults.baseURL = options.baseURL
  }

  if (options?.getAccessToken) {
    accessTokenProvider = options.getAccessToken
  }
}

apiClient.interceptors.request.use(async (config) => {
  const token = await accessTokenProvider()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
