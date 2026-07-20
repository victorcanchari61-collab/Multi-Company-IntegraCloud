import { useAuthStore } from '@/stores/authStore'

export function usePermissions() {
  const allRestrictions = useAuthStore((s) => s.allRestrictions)
  const authGrants = useAuthStore((s) => s.authGrants)
  const isOwner = useAuthStore((s) => s.user?.isOwner ?? false)

  const can = (required: string): boolean =>
    isOwner || !allRestrictions.includes(required)

  const canAny = (required: string[]): boolean => required.some(can)
  const canAll = (required: string[]): boolean => required.every(can)

  /** Checks if the user has an authorization grant for module:action */
  const hasGrant = (module: string, action: string): boolean =>
    isOwner || authGrants.includes(`${module}:${action}`)

  return { allRestrictions, authGrants, isOwner, can, canAny, canAll, hasGrant }
}

/**
 * Verifica si una ruta/vista está restringida y si el usuario
 * ya tiene acceso otorgado (grant) para ella.
 */
export function useAccesoVista(module: string, action: string) {
  const canAccess = usePermissions().can(`${module}.${action}`)
  const hasGrant = usePermissions().hasGrant(module, action)

  return {
    /** El usuario tiene permiso (no está en blacklist) */
    canAccess,
    /** El usuario ya tiene un grant activo para esta acción */
    alreadyGranted: hasGrant,
    /** Requiere solicitar autorización: no puede acceder y no tiene grant */
    requiresAuthorization: !canAccess && !hasGrant,
  }
}
