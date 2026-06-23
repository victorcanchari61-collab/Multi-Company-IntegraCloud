// Constantes centralizadas (ver FRONTEND_ARCHITECTURE.md §10).
// La URL de la API NO vive aquí: viene de la config de entorno (src/config/env.ts).

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    MY_PERMISSIONS: '/auth/me/permissions',
  },
  COMPANIES: '/companies',
  company: (companyId: string) => `/companies/${companyId}`,
  companyModules: (companyId: string) => `/companies/${companyId}/modules`,
  companyUsers: (companyId: string) => `/companies/${companyId}/users`,
  companyUser: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}`,
  companyUserRoles: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}/roles`,
  companyRoles: (companyId: string) => `/companies/${companyId}/roles`,
  companyRolePermissions: (companyId: string, roleId: string) =>
    `/companies/${companyId}/roles/${roleId}/permissions`,
} as const

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
} as const

// Estados (espejan los smallint del backend: ver doc/sistemas/iam.md §4)
export const ENTITY_STATUS = {
  ACTIVE: 1,
  SUSPENDED: 2,
} as const

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  COMPANIES: '/iam/companies',
  USERS: '/iam/users',
  ROLES: '/iam/roles',
} as const

export const STORAGE_KEYS = {
  AUTH: 'integracloud.auth',
  REMEMBER_EMAIL: 'integracloud.remember_email',
} as const
