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

export interface UserDetail {
  id: string
  email: string
  fullName: string
  status: number
  createdAt: string
  roles: UserRoleResult[]
}

export interface UserRoleResult {
  roleId: string
  roleName: string
}

export interface Role {
  id: string
  name: string
  description: string | null
}

export interface RoleDetail {
  id: string
  name: string
  description: string | null
  permissions: PermissionResult[]
}

export interface PermissionResult {
  id: string
  key: string
  description: string
}

export interface Module {
  id: string
  code: string
  name: string
}

export interface CompanyModules {
  companyId: string
  grantedModules: Module[]
  availableModules: Module[]
}

// ── Licenciamiento de dos niveles: sistema → módulos ──
export interface ModuleAccess {
  moduleId: string
  code: string
  name: string
  granted: boolean
}

export interface SystemAccess {
  systemId: string
  code: string
  name: string
  granted: boolean
  /** IAM = sistema base, siempre activo; no se concede ni se quita. */
  isBase: boolean
  modules: ModuleAccess[]
}

export interface CompanyAccess {
  companyId: string
  systems: SystemAccess[]
}

export interface PermissionNode {
  id: string
  key: string
  description: string
}

// ---- Requests ----

export interface CreateCompanyRequest {
  name: string
  slug: string
  legalName?: string | null
  logoUrl?: string | null
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
  // Credenciales de facturación electrónica (se guardan cifradas en secrets.*)
  solUser?: string | null
  solPassword?: string | null
  certificatePassword?: string | null
  certificateFileName?: string | null
  /** Contenido del .pem/.pfx en base64 (sin el prefijo data:). */
  certificateContent?: string | null
  // Administrador inicial de la empresa (provisioning).
  adminEmail?: string | null
  adminFullName?: string | null
  adminPassword?: string | null
}

export interface UpdateCompanyRequest {
  name: string
  slug: string
  legalName?: string | null
  logoUrl?: string | null
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
  // Credenciales SUNAT: solo se actualizan las enviadas.
  solUser?: string | null
  solPassword?: string | null
  certificatePassword?: string | null
  certificateFileName?: string | null
  certificateContent?: string | null
}

export interface CreateUserRequest {
  email: string
  fullName: string
  password: string
}

export interface UpdateUserRequest {
  fullName: string
  email: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface CreateRoleRequest {
  name: string
  description?: string | null
}

export interface UpdateRoleRequest {
  name: string
  description?: string | null
}

export interface ListParams {
  page?: number
  size?: number
  search?: string
  status?: number
}
