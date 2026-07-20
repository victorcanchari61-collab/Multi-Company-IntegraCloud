import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  Company,
  CompanyAccess,
  CompanyModules,
  CreateCompanyRequest,
  ListParams,
  PagedResult,
  UpdateCompanyRequest,
} from '../types/iam'

function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params))
    if (value !== undefined && value !== '') search.set(key, String(value))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const getCompanies = (params: ListParams = {}): Promise<PagedResult<Company>> =>
  api.get<PagedResult<Company>>(
    `${API_ENDPOINTS.COMPANIES}${queryString({
      page: params.page,
      size: params.size,
      status: params.status,
    })}`,
  )

export const getCompany = (id: string): Promise<Company> =>
  api.get<Company>(API_ENDPOINTS.company(id))

export const getCompanyModules = (companyId: string): Promise<CompanyModules> =>
  api.get<CompanyModules>(API_ENDPOINTS.companyModules(companyId))

export const createCompany = (data: CreateCompanyRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.COMPANIES, data)

export const updateCompany = (id: string, data: UpdateCompanyRequest): Promise<void> =>
  api.put<void>(API_ENDPOINTS.company(id), data)

export const suspendCompany = (id: string): Promise<void> =>
  api.post<void>(`${API_ENDPOINTS.company(id)}/suspend`)

export const activateCompany = (id: string): Promise<void> =>
  api.post<void>(`${API_ENDPOINTS.company(id)}/activate`)

export const grantModules = (
  companyId: string,
  moduleIds: string[],
  grantedBy: string,
): Promise<void> =>
  api.post<void>(API_ENDPOINTS.companyModules(companyId), {
    moduleIds,
    grantedBy,
  })

export const revokeModules = (
  companyId: string,
  moduleIds: string[],
): Promise<void> =>
  api.delete<void>(API_ENDPOINTS.companyModules(companyId), { moduleIds })

// ── Licenciamiento de dos niveles ──
export const getCompanyAccess = (companyId: string): Promise<CompanyAccess> =>
  api.get<CompanyAccess>(API_ENDPOINTS.companyAccess(companyId))

export const grantSystems = (
  companyId: string,
  systemIds: string[],
  grantedBy: string,
): Promise<void> =>
  api.post<void>(API_ENDPOINTS.companySystems(companyId), { systemIds, grantedBy })

export const revokeSystem = (companyId: string, systemId: string): Promise<void> =>
  api.delete<void>(API_ENDPOINTS.companySystem(companyId, systemId))
