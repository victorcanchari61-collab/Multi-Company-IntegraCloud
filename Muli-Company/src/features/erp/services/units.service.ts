import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type { UnitOfMeasure, UnitOfMeasureRequest } from '../types/erp'

export const getUnits = (): Promise<UnitOfMeasure[]> =>
  api.get<UnitOfMeasure[]>(API_ENDPOINTS.ERP.units)

export const createUnit = (data: UnitOfMeasureRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.ERP.units, data)

export const updateUnit = (id: string, data: UnitOfMeasureRequest): Promise<void> =>
  api.put<void>(API_ENDPOINTS.ERP.unit(id), data)

export const setUnitStatus = (id: string, active: boolean): Promise<void> =>
  api.post<void>(API_ENDPOINTS.ERP.unitStatus(id), { active })
