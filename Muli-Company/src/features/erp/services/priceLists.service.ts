import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { PriceList, PriceListRequest } from '../types/erp'

export const priceListsService = {
  getAll: () => api.get<PriceList[]>(API_ENDPOINTS.ERP.priceLists),

  create: (data: PriceListRequest) =>
    api.post<PriceList>(API_ENDPOINTS.ERP.priceLists, data),

  update: (id: string, data: PriceListRequest) =>
    api.put(API_ENDPOINTS.ERP.priceList(id), data),

  setStatus: (id: string, isActive: boolean) =>
    api.post(API_ENDPOINTS.ERP.priceListStatus(id), { isActive }),
}
