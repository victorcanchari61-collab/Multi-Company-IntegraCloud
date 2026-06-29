import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { productPricesService } from '../services/productPrices.service'
import type { ProductPriceEntry } from '../types/erp'

export function useProductPrices(productId: string) {
  return useQuery({
    queryKey: ['product-prices', productId],
    queryFn: () => productPricesService.getByProduct(productId),
    enabled: !!productId,
  })
}

export function useSetProductPrices(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (prices: ProductPriceEntry[]) =>
      productPricesService.setPrices(productId, prices),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-prices', productId] })
      toast.success('Precios actualizados')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Error al guardar precios'),
  })
}
