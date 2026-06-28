import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateCompany,
  createCompany,
  getCompanies,
  getCompany,
  getCompanyModules,
  grantModules,
  revokeModules,
  suspendCompany,
  updateCompany,
} from '../services/companies.service'
import type { ListParams, UpdateCompanyRequest } from '../types/iam'

export const companyKeys = {
  all: ['companies'] as const,
  list: (params: ListParams) => [...companyKeys.all, 'list', params] as const,
  detail: (id: string) => [...companyKeys.all, 'detail', id] as const,
  modules: (id: string) => [...companyKeys.all, 'modules', id] as const,
}

export const useCompanies = (params: ListParams = {}) =>
  useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => getCompanies(params),
  })

export const useCompany = (id: string) =>
  useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => getCompany(id),
    enabled: Boolean(id),
  })

export const useCompanyModules = (companyId: string) =>
  useQuery({
    queryKey: companyKeys.modules(companyId),
    queryFn: () => getCompanyModules(companyId),
    enabled: Boolean(companyId),
  })

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.all }),
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyRequest }) =>
      updateCompany(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.all }),
  })
}

export function useSetCompanyStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? activateCompany(id) : suspendCompany(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.all }),
  })
}

export function useGrantModules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      companyId,
      moduleIds,
      grantedBy,
    }: {
      companyId: string
      moduleIds: string[]
      grantedBy: string
    }) => grantModules(companyId, moduleIds, grantedBy),
    onSuccess: (_, vars) =>
      queryClient.invalidateQueries({ queryKey: companyKeys.modules(vars.companyId) }),
  })
}

export function useRevokeModules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      companyId,
      moduleIds,
    }: {
      companyId: string
      moduleIds: string[]
    }) => revokeModules(companyId, moduleIds),
    onSuccess: (_, vars) =>
      queryClient.invalidateQueries({ queryKey: companyKeys.modules(vars.companyId) }),
  })
}
