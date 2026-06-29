import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { currenciesService } from '../services/currencies.service'
import type { CurrencyRequest } from '../types/erp'

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: () => currenciesService.getAll(),
  })
}

export function useCreateCurrency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CurrencyRequest) => currenciesService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currencies'] })
      toast.success('Moneda creada')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al crear moneda'),
  })
}

export function useUpdateCurrency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CurrencyRequest }) =>
      currenciesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currencies'] })
      toast.success('Moneda actualizada')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al actualizar moneda'),
  })
}

export function useSetCurrencyStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      currenciesService.setStatus(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currencies'] })
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al cambiar estado'),
  })
}
