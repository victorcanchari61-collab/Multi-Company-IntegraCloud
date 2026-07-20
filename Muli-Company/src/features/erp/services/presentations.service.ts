import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { ProductPresentation, ProductPresentationRequest } from '../types/erp'

export const presentationsService = {
  getAll: (productId: string) =>
    api.get<ProductPresentation[]>(API_ENDPOINTS.ERP.productPresentations(productId)),

  create: (productId: string, data: ProductPresentationRequest) =>
    api.post<ProductPresentation>(API_ENDPOINTS.ERP.productPresentations(productId), data),

  update: (productId: string, id: string, data: ProductPresentationRequest) =>
    api.put(API_ENDPOINTS.ERP.productPresentation(productId, id), data),

  delete: (productId: string, id: string) =>
    api.delete(API_ENDPOINTS.ERP.productPresentation(productId, id)),
}
