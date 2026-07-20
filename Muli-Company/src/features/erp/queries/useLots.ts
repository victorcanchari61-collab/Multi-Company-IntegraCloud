import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { lotsService } from '../services/lots.service'
import type { ProductLotRequest } from '../types/erp'

export function useProductLots(productId: string) {
  return useQuery({
    queryKey: ['product-lots', productId],
    queryFn: () => lotsService.getAll(productId),
    enabled: !!productId,
  })
}

export function useCreateProductLot(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductLotRequest) => lotsService.create(productId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-lots', productId] })
      toast.success('Lote creado')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al crear lote'),
  })
}

export function useUpdateProductLot(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductLotRequest }) =>
      lotsService.update(productId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-lots', productId] })
      toast.success('Lote actualizado')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al actualizar lote'),
  })
}

export function useDeleteProductLot(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => lotsService.delete(productId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-lots', productId] })
      toast.success('Lote eliminado')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al eliminar lote'),
  })
}
