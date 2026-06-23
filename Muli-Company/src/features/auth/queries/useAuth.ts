import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { getMe, getMyPermissions, login, logout } from '../services/auth.service'
import type { LoginRequest } from '../types/auth'

/** Login: guarda sesión y carga perfil + permisos efectivos en el store. */
export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  const setUser = useAuthStore((s) => s.setUser)
  const setPermissions = useAuthStore((s) => s.setPermissions)

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: async (tokens) => {
      setSession(tokens)
      const [me, permissions] = await Promise.all([getMe(), getMyPermissions()])
      setUser(me)
      setPermissions(permissions)
    },
  })
}

/** Cierra sesión en el backend, limpia store y caché de queries. */
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

/**
 * Rehidrata perfil + permisos cuando hay token persistido (p. ej. tras recargar).
 * Los permisos no se persisten: siempre se piden frescos a la API.
 */
export function useAuthBootstrap() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const setUser = useAuthStore((s) => s.setUser)
  const setPermissions = useAuthStore((s) => s.setPermissions)

  return useQuery({
    queryKey: ['auth', 'bootstrap'],
    enabled: Boolean(accessToken),
    staleTime: Infinity,
    queryFn: async () => {
      const [me, permissions] = await Promise.all([getMe(), getMyPermissions()])
      setUser(me)
      setPermissions(permissions)
      return me
    },
  })
}
