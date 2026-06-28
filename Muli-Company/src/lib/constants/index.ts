export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    MY_PERMISSIONS: '/auth/me/permissions',
    CHANGE_PASSWORD: '/auth/me/change-password',
  },
  COMPANIES: '/companies',
  PERMISSIONS: '/permissions',
  LOOKUP: {
    ruc: (ruc: string) => `/lookup/ruc/${ruc}`,
    dni: (dni: string) => `/lookup/dni/${dni}`,
  },
  company: (companyId: string) => `/companies/${companyId}`,
  companyModules: (companyId: string) => `/companies/${companyId}/modules`,
  companyUsers: (companyId: string) => `/companies/${companyId}/users`,
  companyUser: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}`,
  companyUserRoles: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}/roles`,
  companyUserChangePassword: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}/change-password`,
  companyUserDeactivate: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}/deactivate`,
  companyUserReactivate: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}/reactivate`,
  companyRoles: (companyId: string) => `/companies/${companyId}/roles`,
  companyRole: (companyId: string, roleId: string) =>
    `/companies/${companyId}/roles/${roleId}`,
  companyRolePermissions: (companyId: string, roleId: string) =>
    `/companies/${companyId}/roles/${roleId}/permissions`,
} as const

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
} as const

export const ENTITY_STATUS = {
  ACTIVE: 1,
  SUSPENDED: 2,
} as const

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  COMPANIES: '/iam/companies',
  COMPANY_DETAIL: '/iam/companies/$companyId',
  USERS: '/iam/users',
  USER_DETAIL: '/iam/users/$userId',
  ROLES: '/iam/roles',
  ROLE_DETAIL: '/iam/roles/$roleId',
  PROFILE: '/profile',
} as const

export const STORAGE_KEYS = {
  AUTH: 'integracloud.auth',
  REMEMBER_EMAIL: 'integracloud.remember_email',
  SIDEBAR: 'integracloud.sidebar',
} as const

export const APP_NAME = 'BRAVIC SYSTEMS'
