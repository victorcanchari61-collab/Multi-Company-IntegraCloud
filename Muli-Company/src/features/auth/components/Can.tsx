import type { ReactNode } from 'react'
import { usePermissions } from '../hooks/usePermissions'

interface CanProps {
  permission: string
  fallback?: ReactNode
  children: ReactNode
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const { can } = usePermissions()
  return can(permission) ? <>{children}</> : <>{fallback}</>
}

interface CanAnyProps {
  anyOf: string[]
  fallback?: ReactNode
  children: ReactNode
}

export function CanAny({ anyOf, fallback = null, children }: CanAnyProps) {
  const { canAny } = usePermissions()
  return canAny(anyOf) ? <>{children}</> : <>{fallback}</>
}

interface CanAllProps {
  allOf: string[]
  fallback?: ReactNode
  children: ReactNode
}

export function CanAll({ allOf, fallback = null, children }: CanAllProps) {
  const { canAll } = usePermissions()
  return canAll(allOf) ? <>{children}</> : <>{fallback}</>
}
