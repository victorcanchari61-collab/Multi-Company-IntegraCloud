import type { ReactNode } from 'react'
import { usePermissions } from '../hooks/usePermissions'

interface Props {
  /** Permiso requerido, p. ej. "iam.companies.create". */
  permission?: string
  /** Permisos requeridos; por defecto basta con uno (any). */
  anyOf?: string[]
  /** Requiere todos los permisos de la lista. */
  allOf?: string[]
  /** Contenido a mostrar cuando NO tiene permiso. */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Muestra `children` solo si el usuario tiene el permiso indicado.
 * Recordatorio: esto es UX; la autorización real la valida el backend.
 */
export function Can({ permission, anyOf, allOf, fallback = null, children }: Props) {
  const { can, canAny, canAll } = usePermissions()

  const allowed =
    (permission ? can(permission) : true) &&
    (anyOf ? canAny(anyOf) : true) &&
    (allOf ? canAll(allOf) : true)

  return <>{allowed ? children : fallback}</>
}
