// Tipos del feature IAM (administración). Espejan los DTOs del backend.
// Referencia del modelo: doc/sistemas/iam.md

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export interface Company {
  id: string
  name: string
  slug: string
  legalName: string | null
  logoUrl: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  taxId: string | null
  taxAddress: string | null
  economicActivity: string | null
  taxpayerType: number
  accountingRequired: boolean
  settlementCurrency: string
  status: number
  createdAt: string
}

export interface User {
  id: string
  email: string
  fullName: string
  status: number
  createdAt: string
}

export interface Role {
  id: string
  name: string
  description: string | null
}

export interface Module {
  id: string
  code: string
  name: string
}

export interface PermissionNode {
  id: string
  key: string
  description: string
}

// ---- Requests (payloads de los Commands) ----

export interface CreateCompanyRequest {
  name: string
  slug: string
  legalName?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  address?: string | null
  taxId?: string | null
  taxAddress?: string | null
  economicActivity?: string | null
  taxpayerType?: number
  accountingRequired?: boolean
  settlementCurrency?: string
}

export interface CreateUserRequest {
  email: string
  fullName: string
  password: string
}

export interface CreateRoleRequest {
  name: string
  description?: string | null
}

export interface ListParams {
  page?: number
  size?: number
  search?: string
  status?: number
}
