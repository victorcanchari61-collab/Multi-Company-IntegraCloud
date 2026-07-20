import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addRoleRestriction,
  addUserRestriction,
  getUserRestrictions,
  removeRoleRestriction,
  removeUserRestriction,
} from '../services/restrictions.service'
import { roleKeys } from './useRoles'

export const restrictionKeys = {
  userRestrictions: (companyId: string, userId: string) =>
    ['restrictions', companyId, 'users', userId] as const,
}

export const useUserRestrictions = (companyId: string, userId: string) =>
  useQuery({
    queryKey: restrictionKeys.userRestrictions(companyId, userId),
    queryFn: () => getUserRestrictions(companyId, userId),
    enabled: Boolean(companyId) && Boolean(userId),
  })

export function useAddRoleRestriction(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      roleId,
      restrictedKey,
    }: {
      roleId: string
      restrictedKey: string
    }) => addRoleRestriction(companyId, roleId, restrictedKey),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: roleKeys.all(companyId) }),
  })
}

export function useRemoveRoleRestriction(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      roleId,
      restrictedKey,
    }: {
      roleId: string
      restrictedKey: string
    }) => removeRoleRestriction(companyId, roleId, restrictedKey),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: roleKeys.all(companyId) }),
  })
}

export function useAddUserRestriction(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      restrictedKey,
    }: {
      userId: string
      restrictedKey: string
    }) => addUserRestriction(companyId, userId, restrictedKey),
    onSuccess: (_, vars) =>
      queryClient.invalidateQueries({
        queryKey: restrictionKeys.userRestrictions(companyId, vars.userId),
      }),
  })
}

export function useRemoveUserRestriction(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      restrictedKey,
    }: {
      userId: string
      restrictedKey: string
    }) => removeUserRestriction(companyId, userId, restrictedKey),
    onSuccess: (_, vars) =>
      queryClient.invalidateQueries({
        queryKey: restrictionKeys.userRestrictions(companyId, vars.userId),
      }),
  })
}
