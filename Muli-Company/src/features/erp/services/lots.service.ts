import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { ProductLot, ProductLotRequest } from '../types/erp'

export const lotsService = {
  getAll: (productId: string) =>
    api.get<ProductLot[]>(API_ENDPOINTS.ERP.productLots(productId)),

  create: (productId: string, data: ProductLotRequest) =>
    api.post<ProductLot>(API_ENDPOINTS.ERP.productLots(productId), data),

  update: (productId: string, id: string, data: ProductLotRequest) =>
    api.put(API_ENDPOINTS.ERP.productLot(productId, id), data),

  delete: (productId: string, id: string) =>
    api.delete(API_ENDPOINTS.ERP.productLot(productId, id)),
}
