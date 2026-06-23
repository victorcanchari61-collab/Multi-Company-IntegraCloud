import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignPermissionsToRole,
  createRole,
  getRoles,
} from '../services/roles.service'
import type { CreateRoleRequest } from '../types/iam'

export const roleKeys = {
  all: (companyId: string) => ['roles', companyId] as const,
}

export const useRoles = (companyId: string) =>
  useQuery({
    queryKey: roleKeys.all(companyId),
    queryFn: () => getRoles(companyId),
    enabled: Boolean(companyId),
  })

export function useCreateRole(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRoleRequest) => createRole(companyId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: roleKeys.all(companyId) }),
  })
}

export function useAssignPermissionsToRole(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      assignPermissionsToRole(companyId, roleId, permissionIds),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: roleKeys.all(companyId) }),
  })
}
