import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { Currency, CurrencyRequest } from '../types/erp'

export const currenciesService = {
  getAll: () => api.get<Currency[]>(API_ENDPOINTS.ERP.currencies),

  create: (data: CurrencyRequest) =>
    api.post<Currency>(API_ENDPOINTS.ERP.currencies, data),

  update: (id: string, data: CurrencyRequest) =>
    api.put(API_ENDPOINTS.ERP.currency(id), data),

  setStatus: (id: string, isActive: boolean) =>
    api.post(API_ENDPOINTS.ERP.currencyStatus(id), { isActive }),
}
