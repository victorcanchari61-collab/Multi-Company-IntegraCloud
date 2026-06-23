import { env } from '@/config/env'
import { API_ENDPOINTS } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'
import type { AuthTokens } from '@/features/auth/types/auth'

/** Error normalizado de la API. El backend responde { code, message }. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// Refresh de token en un solo vuelo (single-flight): varias requests que reciben
// 401 a la vez comparten el mismo intento de refresh.
let refreshInFlight: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  const { refreshToken, setSession, clear } = useAuthStore.getState()
  if (!refreshToken) {
    clear()
    return false
  }

  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${env.API_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) {
        clear()
        return false
      }
      setSession((await res.json()) as AuthTokens)
      return true
    } catch {
      clear()
      return false
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const exec = () => {
    const { accessToken } = useAuthStore.getState()
    const headers = new Headers(options.headers)
    if (options.body && !headers.has('Content-Type'))
      headers.set('Content-Type', 'application/json')
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
    return fetch(`${env.API_URL}${endpoint}`, { ...options, headers })
  }

  let response = await exec()

  // Token expirado: intenta refrescar una vez y reintenta la request.
  if (response.status === 401 && useAuthStore.getState().refreshToken) {
    if (await refreshSession()) response = await exec()
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { code?: string; message?: string }
      | null
    throw new ApiError(
      response.status,
      body?.code ?? 'unknown_error',
      body?.message ?? response.statusText,
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

const json = (body: unknown) => (body === undefined ? undefined : JSON.stringify(body))

/**
 * Cliente HTTP de la app. Toda comunicación con el backend pasa por aquí.
 *   const products = await api<Product[]>('/products')
 *   const id = await api.post<string>('/products', dto)
 */
export const api = Object.assign(request, {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: json(body) }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: json(body) }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: json(body) }),
  delete: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'DELETE', body: json(body) }),
})
