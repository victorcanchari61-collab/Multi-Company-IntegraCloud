import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { CreateRoleRequest, Role } from '../types/iam'

export const getRoles = (companyId: string): Promise<Role[]> =>
  api.get<Role[]>(API_ENDPOINTS.companyRoles(companyId))

export const createRole = (companyId: string, data: CreateRoleRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.companyRoles(companyId), data)

export const assignPermissionsToRole = (
  companyId: string,
  roleId: string,
  permissionIds: string[],
): Promise<void> =>
  api.post<void>(API_ENDPOINTS.companyRolePermissions(companyId, roleId), {
    permissionIds,
  })
