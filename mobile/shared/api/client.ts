import axios, { isAxiosError } from 'axios'
import { Platform } from 'react-native'

type TokenProvider = () => string | null | Promise<string | null>
// Devuelve un access token nuevo (renovado con el refresh token) o null si
// la sesion no se puede renovar. Lo inyecta el layout raiz.
type SessionRefresher = () => Promise<string | null>

// Flag interno del retry post-refresh (evita loops de 401 encadenados).
declare module 'axios' {
  export interface AxiosRequestConfig {
    retriedAfterRefresh?: boolean
  }
}

function resolveBaseUrl() {
  return process.env.EXPO_PUBLIC_API_URL ?? (
    Platform.OS === 'android'
      ? 'http://10.0.2.2:8080/api/v1'
      : 'http://localhost:8080/api/v1'
  )
}

// Resuelve la URL absoluta de un asset servido por el backend (ej. imagenes del
// catalogo de plagas, feature 54). El backend las sirve en el ORIGIN, fuera de
// /api/v1, con paths relativos tipo "/uploads/plagas-catalogo/xxx.jpg". Deriva el
// origin de la baseURL (quitando el sufijo /api/v1) respetando 10.0.2.2/localhost/
// EXPO_PUBLIC_API_URL. Si ya viene absoluta (http/https) se devuelve tal cual.
export function resolveAssetUrl(relativeUrl?: string | null): string | undefined {
  if (!relativeUrl) return undefined
  if (/^https?:\/\//i.test(relativeUrl)) return relativeUrl
  const base = apiClient.defaults.baseURL ?? resolveBaseUrl()
  const origin = base.replace(/\/api\/v1\/?$/, '')
  const path = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`
  return `${origin}${path}`
}

let accessTokenProvider: TokenProvider = () => null
let sessionRefresher: SessionRefresher | null = null
// Single-flight: si N requests reciben 401 a la vez, un solo refresh en curso.
let refreshInFlight: Promise<string | null> | null = null

export const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
})

export function configureApiClient(options?: {
  baseURL?: string
  getAccessToken?: TokenProvider
  refreshSession?: SessionRefresher
}) {
  if (options?.baseURL) {
    apiClient.defaults.baseURL = options.baseURL
  }

  if (options?.getAccessToken) {
    accessTokenProvider = options.getAccessToken
  }

  if (options?.refreshSession) {
    sessionRefresher = options.refreshSession
  }
}

apiClient.interceptors.request.use(async (config) => {
  const token = await accessTokenProvider()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Los endpoints de auth no se reintentan: un 401 ahi es credencial invalida.
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']

// Ante un 401 (access token vencido), renueva la sesion con el refresh token
// y reintenta la request original una sola vez. Sin esto, la app quedaba
// "muda" al vencer el token: las pantallas caian a la replica offline y los
// datos on-demand (historiales del animal, etc.) aparecian vacios.
apiClient.interceptors.response.use(undefined, async (error) => {
  const config = isAxiosError(error) ? error.config : undefined
  const status = isAxiosError(error) ? error.response?.status : undefined

  // 401 es lo semanticamente correcto, pero el backend historicamente devolvia
  // 403 ante token vencido (sin authenticationEntryPoint): se cubren ambos.
  // Un 403 real de permisos solo cuesta un refresh + retry y vuelve a fallar.
  const isRefreshable =
    (status === 401 || status === 403) &&
    config &&
    !config.retriedAfterRefresh &&
    sessionRefresher &&
    !AUTH_PATHS.some((path) => config.url?.includes(path))

  if (!isRefreshable) throw error

  if (!refreshInFlight) {
    refreshInFlight = sessionRefresher().finally(() => {
      refreshInFlight = null
    })
  }

  const newToken = await refreshInFlight
  if (!newToken) throw error

  config.retriedAfterRefresh = true
  config.headers.Authorization = `Bearer ${newToken}`
  return apiClient.request(config)
})
