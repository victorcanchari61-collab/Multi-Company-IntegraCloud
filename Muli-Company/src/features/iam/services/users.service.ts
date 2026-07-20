import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  CreateUserRequest,
  ListParams,
  PagedResult,
  UpdateUserRequest,
  User,
  UserDetail,
  ChangePasswordRequest,
} from '../types/iam'

function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params))
    if (value !== undefined && value !== '') search.set(key, String(value))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const getUsers = (
  companyId: string,
  params: ListParams = {},
): Promise<PagedResult<User>> =>
  api.get<PagedResult<User>>(
    `${API_ENDPOINTS.companyUsers(companyId)}${queryString({
      page: params.page,
      size: params.size,
      search: params.search,
    })}`,
  )

export const getUserById = (companyId: string, userId: string): Promise<UserDetail> =>
  api.get<UserDetail>(API_ENDPOINTS.companyUser(companyId, userId))

export const createUser = (companyId: string, data: CreateUserRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.companyUsers(companyId), data)

export const updateUser = (
  companyId: string,
  userId: string,
  data: UpdateUserRequest,
): Promise<void> => api.put<void>(API_ENDPOINTS.companyUser(companyId, userId), data)

export const deactivateUser = (companyId: string, userId: string): Promise<void> =>
  api.post<void>(API_ENDPOINTS.companyUserDeactivate(companyId, userId))

export const reactivateUser = (companyId: string, userId: string): Promise<void> =>
  api.post<void>(API_ENDPOINTS.companyUserReactivate(companyId, userId))

export const changePassword = (
  companyId: string,
  userId: string,
  data: ChangePasswordRequest,
): Promise<void> =>
  api.post<void>(API_ENDPOINTS.companyUserChangePassword(companyId, userId), data)

export const assignRolesToUser = (
  companyId: string,
  userId: string,
  roleIds: string[],
): Promise<void> =>
  api.post<void>(API_ENDPOINTS.companyUserRoles(companyId, userId), { roleIds })
