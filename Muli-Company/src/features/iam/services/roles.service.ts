import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  CreateRoleRequest,
  Role,
  RoleDetail,
  UpdateRoleRequest,
} from '../types/iam'

export const getRoles = (companyId: string): Promise<Role[]> =>
  api.get<Role[]>(API_ENDPOINTS.companyRoles(companyId))

export const getRoleById = (companyId: string, roleId: string): Promise<RoleDetail> =>
  api.get<RoleDetail>(API_ENDPOINTS.companyRole(companyId, roleId))

export const createRole = (companyId: string, data: CreateRoleRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.companyRoles(companyId), data)

export const updateRole = (
  companyId: string,
  roleId: string,
  data: UpdateRoleRequest,
): Promise<void> => api.put<void>(API_ENDPOINTS.companyRole(companyId, roleId), data)

export const deleteRole = (companyId: string, roleId: string): Promise<void> =>
  api.delete<void>(API_ENDPOINTS.companyRole(companyId, roleId))

export const assignPermissionsToRole = (
  companyId: string,
  roleId: string,
  permissionIds: string[],
): Promise<void> =>
  api.post<void>(API_ENDPOINTS.companyRolePermissions(companyId, roleId), {
    permissionIds,
  })
