import { usePermissions } from './usePermissions'

export function usePermission(required: string): boolean {
  return usePermissions().can(required)
}
