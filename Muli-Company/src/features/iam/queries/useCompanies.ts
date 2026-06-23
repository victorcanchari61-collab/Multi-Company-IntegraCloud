import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateCompany,
  createCompany,
  getCompanies,
  getCompany,
  suspendCompany,
} from '../services/companies.service'
import type { ListParams } from '../types/iam'

export const companyKeys = {
  all: ['companies'] as const,
  list: (params: ListParams) => [...companyKeys.all, 'list', params] as const,
  detail: (id: string) => [...companyKeys.all, 'detail', id] as const,
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

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCompany,
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
