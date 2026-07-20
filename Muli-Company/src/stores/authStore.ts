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
  allRestrictions: string[]
  authGrants: string[]
  rolSistema: string | null
  roleName: string | null
  companySlug: string | null

  setSession: (tokens: AuthTokens) => void
  setUser: (user: AuthUser) => void
  setPermissions: (permissions: string[]) => void
  setAllRestrictions: (restrictions: string[]) => void
  setCompanySlug: (slug: string | null) => void
  clear: () => void
}

const initial = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
  permissions: [] as string[],
  allRestrictions: [] as string[],
  authGrants: [] as string[],
  rolSistema: null as string | null,
  roleName: null as string | null,
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
      setUser: (user) =>
        set({
          user,
          allRestrictions: user.allRestrictions ?? [],
          authGrants: user.authGrants ?? [],
          rolSistema: user.rolSistema ?? null,
          roleName: user.roleName ?? null,
        }),
      setPermissions: (permissions) => set({ permissions }),
      setAllRestrictions: (restrictions) => set({ allRestrictions: restrictions }),
      setCompanySlug: (slug) => set({ companySlug: slug }),
      clear: () => set({ ...initial }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
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
