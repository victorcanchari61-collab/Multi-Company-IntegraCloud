import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { ProductPrice, ProductPriceEntry } from '../types/erp'

export const productPricesService = {
  getByProduct: (productId: string) =>
    api.get<ProductPrice[]>(API_ENDPOINTS.ERP.productPrices(productId)),

  setPrices: (productId: string, prices: ProductPriceEntry[]) =>
    api.put(API_ENDPOINTS.ERP.productPrices(productId), { prices }),
}
