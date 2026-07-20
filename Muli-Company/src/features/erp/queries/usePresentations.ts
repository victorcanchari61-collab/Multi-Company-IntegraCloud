import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { presentationsService } from '../services/presentations.service'
import type { ProductPresentationRequest } from '../types/erp'

export function useProductPresentations(productId: string) {
  return useQuery({
    queryKey: ['product-presentations', productId],
    queryFn: () => presentationsService.getAll(productId),
    enabled: !!productId,
  })
}

export function useCreateProductPresentation(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductPresentationRequest) =>
      presentationsService.create(productId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-presentations', productId] })
      toast.success('Presentación creada')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al crear presentación'),
  })
}

export function useUpdateProductPresentation(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductPresentationRequest }) =>
      presentationsService.update(productId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-presentations', productId] })
      toast.success('Presentación actualizada')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al actualizar presentación'),
  })
}

export function useDeleteProductPresentation(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => presentationsService.delete(productId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-presentations', productId] })
      toast.success('Presentación eliminada')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al eliminar presentación'),
  })
}
