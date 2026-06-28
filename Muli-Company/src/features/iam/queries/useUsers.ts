import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignRolesToUser,
  changePassword,
  createUser,
  deactivateUser,
  getUserById,
  getUsers,
  reactivateUser,
  updateUser,
} from '../services/users.service'
import type {
  ChangePasswordRequest,
  CreateUserRequest,
  ListParams,
  UpdateUserRequest,
} from '../types/iam'

export const userKeys = {
  all: (companyId: string) => ['users', companyId] as const,
  list: (companyId: string, params: ListParams) =>
    [...userKeys.all(companyId), 'list', params] as const,
  detail: (companyId: string, userId: string) =>
    [...userKeys.all(companyId), 'detail', userId] as const,
}

export const useUsers = (companyId: string, params: ListParams = {}) =>
  useQuery({
    queryKey: userKeys.list(companyId, params),
    queryFn: () => getUsers(companyId, params),
    enabled: Boolean(companyId),
  })

export const useUserById = (companyId: string, userId: string) =>
  useQuery({
    queryKey: userKeys.detail(companyId, userId),
    queryFn: () => getUserById(companyId, userId),
    enabled: Boolean(companyId) && Boolean(userId),
  })

export function useCreateUser(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(companyId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.all(companyId) }),
  })
}

export function useUpdateUser(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string
      data: UpdateUserRequest
    }) => updateUser(companyId, userId, data),
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

export function useReactivateUser(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => reactivateUser(companyId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.all(companyId) }),
  })
}

export function useChangePassword(companyId: string) {
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string
      data: ChangePasswordRequest
    }) => changePassword(companyId, userId, data),
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
