import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { getMe, getMyPermissions, login, logout } from '../services/auth.service'
import type { LoginRequest } from '../types/auth'

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  const setUser = useAuthStore((s) => s.setUser)
  const setPermissions = useAuthStore((s) => s.setPermissions)
  const setAllRestrictions = useAuthStore((s) => s.setAllRestrictions)
  const setCompanySlug = useAuthStore((s) => s.setCompanySlug)

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: async (tokens, variables) => {
      setSession(tokens)
      setCompanySlug(variables.slug ?? null)
      const [me, permissions] = await Promise.all([getMe(), getMyPermissions()])
      setUser(me)
      setPermissions(permissions)
      setAllRestrictions(me.allRestrictions)
    },
  })
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) await logout(refreshToken)
    },
    onSettled: () => {
      clear()
      queryClient.clear()
    },
  })
}

export function useAuthBootstrap() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const setUser = useAuthStore((s) => s.setUser)
  const setPermissions = useAuthStore((s) => s.setPermissions)
  const setAllRestrictions = useAuthStore((s) => s.setAllRestrictions)

  return useQuery({
    queryKey: ['auth', 'bootstrap'],
    enabled: Boolean(accessToken),
    staleTime: Infinity,
    queryFn: async () => {
      const [me, permissions] = await Promise.all([getMe(), getMyPermissions()])
      setUser(me)
      setPermissions(permissions)
      setAllRestrictions(me.allRestrictions)
      return me
    },
  })
}
