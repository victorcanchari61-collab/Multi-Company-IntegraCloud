import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignRolesToUser,
  createUser,
  deactivateUser,
  getUsers,
} from '../services/users.service'
import type { CreateUserRequest, ListParams } from '../types/iam'

export const userKeys = {
  all: (companyId: string) => ['users', companyId] as const,
  list: (companyId: string, params: ListParams) =>
    [...userKeys.all(companyId), 'list', params] as const,
}

export const useUsers = (companyId: string, params: ListParams = {}) =>
  useQuery({
    queryKey: userKeys.list(companyId, params),
    queryFn: () => getUsers(companyId, params),
    enabled: Boolean(companyId),
  })

export function useCreateUser(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(companyId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.all(companyId) }),
  })
}

export function useDeactivateUser(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => deactivateUser(companyId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.all(companyId) }),
  })
}

export function useAssignRolesToUser(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      assignRolesToUser(companyId, userId, roleIds),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.all(companyId) }),
  })
}
