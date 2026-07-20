import { useQuery } from '@tanstack/react-query'
import { getAllPermissions } from '../services/permissions.service'

export const permissionKeys = {
  all: ['permissions'] as const,
}

export const useAllPermissions = () =>
  useQuery({
    queryKey: permissionKeys.all,
    queryFn: () => getAllPermissions(),
    staleTime: 5 * 60 * 1000,
  })
