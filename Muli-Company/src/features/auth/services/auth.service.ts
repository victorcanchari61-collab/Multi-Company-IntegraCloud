import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { AuthTokens, AuthUser, LoginRequest } from '../types/auth'

export const login = (data: LoginRequest): Promise<AuthTokens> =>
  api.post<AuthTokens>(API_ENDPOINTS.AUTH.LOGIN, data)

export const logout = (refreshToken: string): Promise<void> =>
  api.post<void>(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken })

export const getMe = (): Promise<AuthUser> =>
  api.get<AuthUser>(API_ENDPOINTS.AUTH.ME)

export const getMyPermissions = (): Promise<string[]> =>
  api.get<string[]>(API_ENDPOINTS.AUTH.MY_PERMISSIONS)
