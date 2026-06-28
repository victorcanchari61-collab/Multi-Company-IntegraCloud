import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignPermissionsToRole,
  createRole,
  deleteRole,
  getRoleById,
  getRoles,
  updateRole,
} from '../services/roles.service'
import type { CreateRoleRequest, UpdateRoleRequest } from '../types/iam'

export const roleKeys = {
  all: (companyId: string) => ['roles', companyId] as const,
  detail: (companyId: string, roleId: string) =>
    [...roleKeys.all(companyId), 'detail', roleId] as const,
}

export const useRoles = (companyId: string) =>
  useQuery({
    queryKey: roleKeys.all(companyId),
    queryFn: () => getRoles(companyId),
    enabled: Boolean(companyId),
  })

export const useRoleById = (companyId: string, roleId: string) =>
  useQuery({
    queryKey: roleKeys.detail(companyId, roleId),
    queryFn: () => getRoleById(companyId, roleId),
    enabled: Boolean(companyId) && Boolean(roleId),
  })

export function useCreateRole(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRoleRequest) => createRole(companyId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: roleKeys.all(companyId) }),
  })
}

export function useUpdateRole(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: string
      data: UpdateRoleRequest
    }) => updateRole(companyId, roleId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: roleKeys.all(companyId) }),
  })
}

export function useDeleteRole(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roleId: string) => deleteRole(companyId, roleId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: roleKeys.all(companyId) }),
  })
}

export function useAssignPermissionsToRole(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string
      permissionIds: string[]
    }) => assignPermissionsToRole(companyId, roleId, permissionIds),
    onSuccess: (_, vars) =>
      queryClient.invalidateQueries({
        queryKey: roleKeys.detail(companyId, vars.roleId),
      }),
  })
}
