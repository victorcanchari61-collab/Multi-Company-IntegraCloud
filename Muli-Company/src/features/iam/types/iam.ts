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

// ── Permission keys (única fuente de verdad para el frontend) ──
// Formato: {system}.{module}.{action}
// Generado por: Backend.Infrastructure.IAM.IamSeedService
export const PERMISSIONS = {
  IAM_USERS_VIEW: 'iam.users.view',
  IAM_USERS_READ: 'iam.users.read',
  IAM_USERS_CREATE: 'iam.users.create',
  IAM_USERS_UPDATE: 'iam.users.update',
  IAM_USERS_DELETE: 'iam.users.delete',
  IAM_USERS_ASSIGN_ROLES: 'iam.users.assign_roles',
  IAM_ROLES_VIEW: 'iam.roles.view',
  IAM_ROLES_READ: 'iam.roles.read',
  IAM_ROLES_CREATE: 'iam.roles.create',
  IAM_ROLES_UPDATE: 'iam.roles.update',
  IAM_ROLES_DELETE: 'iam.roles.delete',
  IAM_ROLES_ASSIGN_PERMISSIONS: 'iam.roles.assign_permissions',
  IAM_COMPANIES_VIEW: 'iam.companies.view',
  IAM_COMPANIES_READ: 'iam.companies.read',
  IAM_COMPANIES_CREATE: 'iam.companies.create',
  IAM_COMPANIES_UPDATE: 'iam.companies.update',
  IAM_COMPANIES_DELETE: 'iam.companies.delete',
  IAM_COMPANIES_MANAGE_MODULES: 'iam.companies.manage_modules',
  IAM_PERMISSIONS_VIEW: 'iam.permissions.view',
  IAM_PERMISSIONS_READ: 'iam.permissions.read',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
