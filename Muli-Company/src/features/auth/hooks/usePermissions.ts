import { useAuthStore } from '@/stores/authStore'

/**
 * Comprueba si un permiso otorgado cubre al requerido, soportando comodines:
 *   `erp.*`           cubre  `erp.products.create`
 *   `erp.products.*`  cubre  `erp.products.list.export`
 *   `*`               cubre  todo
 */
function matches(granted: string, required: string): boolean {
  if (granted === '*' || granted === required) return true
  if (granted.endsWith('.*')) return required.startsWith(granted.slice(0, -1))
  return false
}

/**
 * Acceso a los permisos efectivos del usuario (ver doc/sistemas/iam.md §5).
 * El Owner de la plataforma tiene acceso total.
 */
export function usePermissions() {
  const permissions = useAuthStore((s) => s.permissions)
  const isOwner = useAuthStore((s) => s.user?.isOwner ?? false)

  const can = (required: string): boolean =>
    isOwner || permissions.some((g) => matches(g, required))

  const canAny = (required: string[]): boolean => required.some(can)
  const canAll = (required: string[]): boolean => required.every(can)

  return { permissions, isOwner, can, canAny, canAll }
}
