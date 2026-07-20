import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { RestrictionRequest } from '../types/iam'

export const addRoleRestriction = (
  companyId: string,
  roleId: string,
  restrictedKey: string,
): Promise<void> =>
  api.post<void>(API_ENDPOINTS.companyRoleRestrictions(companyId, roleId), {
    restrictedKey,
  } satisfies RestrictionRequest)

export const removeRoleRestriction = (
  companyId: string,
  roleId: string,
  restrictedKey: string,
): Promise<void> =>
  api.delete<void>(
    API_ENDPOINTS.companyRoleRestriction(companyId, roleId, restrictedKey),
  )

export const getUserRestrictions = (
  companyId: string,
  userId: string,
): Promise<string[]> =>
  api.get<string[]>(API_ENDPOINTS.companyUserRestrictions(companyId, userId))

export const addUserRestriction = (
  companyId: string,
  userId: string,
  restrictedKey: string,
): Promise<void> =>
  api.post<void>(API_ENDPOINTS.companyUserRestrictions(companyId, userId), {
    restrictedKey,
  } satisfies RestrictionRequest)

export const removeUserRestriction = (
  companyId: string,
  userId: string,
  restrictedKey: string,
): Promise<void> =>
  api.delete<void>(
    API_ENDPOINTS.companyUserRestriction(companyId, userId, restrictedKey),
  )
