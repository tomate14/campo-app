import axios from 'axios'

type TokenProvider = () => string | null | Promise<string | null>

declare global {
  interface Window {
    __CAMPO_API_URL__?: string
  }
}

function resolveBaseUrl() {
  if (typeof window !== 'undefined' && typeof window.__CAMPO_API_URL__ === 'string' && window.__CAMPO_API_URL__) {
    return window.__CAMPO_API_URL__
  }

  return 'http://localhost:8080/api/v1'
}

let accessTokenProvider: TokenProvider = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem('access_token')
}

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

    if (typeof window !== 'undefined') {
      window.__CAMPO_API_URL__ = options.baseURL
    }
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
