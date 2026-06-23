import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { CreateUserRequest, ListParams, PagedResult, User } from '../types/iam'

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

export const createUser = (companyId: string, data: CreateUserRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.companyUsers(companyId), data)

export const deactivateUser = (companyId: string, userId: string): Promise<void> =>
  api.post<void>(`${API_ENDPOINTS.companyUser(companyId, userId)}/deactivate`)

export const assignRolesToUser = (
  companyId: string,
  userId: string,
  roleIds: string[],
): Promise<void> =>
  api.post<void>(API_ENDPOINTS.companyUserRoles(companyId, userId), { roleIds })
