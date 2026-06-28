import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'
import type { AuthTokens, AuthUser } from '@/features/auth/types/auth'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: string | null
  user: AuthUser | null
  permissions: string[]
  companySlug: string | null

  setSession: (tokens: AuthTokens) => void
  setUser: (user: AuthUser) => void
  setPermissions: (permissions: string[]) => void
  setCompanySlug: (slug: string | null) => void
  clear: () => void
}

const initial = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
  permissions: [] as string[],
  companySlug: null as string | null,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initial,
      setSession: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        }),
      setUser: (user) => set({ user }),
      setPermissions: (permissions) => set({ permissions }),
      setCompanySlug: (slug) => set({ companySlug: slug }),
      clear: () => set({ ...initial }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      // Los permisos se rehidratan desde la API en cada arranque; solo persistimos sesión.
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt,
        user: s.user,
        companySlug: s.companySlug,
      }),
    },
  ),
)

export const selectIsAuthenticated = (s: AuthState) => Boolean(s.accessToken)
