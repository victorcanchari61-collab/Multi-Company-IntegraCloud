import { useAuthStore } from '@/stores/authStore'

/**
 * Empresa "activa" para la administración de usuarios/roles.
 * Un Company Admin opera sobre su propia empresa; el Owner (companyId null)
 * debería elegir una empresa (selector pendiente).
 */
export function useActiveCompanyId(): string | null {
  return useAuthStore((s) => s.user?.companyId ?? null)
}
