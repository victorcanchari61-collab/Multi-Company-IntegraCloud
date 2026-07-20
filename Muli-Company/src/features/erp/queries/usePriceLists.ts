import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { priceListsService } from '../services/priceLists.service'
import type { PriceListRequest } from '../types/erp'

export function usePriceLists() {
  return useQuery({
    queryKey: ['price-lists'],
    queryFn: () => priceListsService.getAll(),
  })
}

export function useCreatePriceList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PriceListRequest) => priceListsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['price-lists'] })
      toast.success('Lista de precios creada')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al crear lista de precios'),
  })
}

export function useUpdatePriceList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PriceListRequest }) =>
      priceListsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['price-lists'] })
      toast.success('Lista de precios actualizada')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al actualizar lista de precios'),
  })
}

export function useSetPriceListStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      priceListsService.setStatus(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['price-lists'] })
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al cambiar estado'),
  })
}
