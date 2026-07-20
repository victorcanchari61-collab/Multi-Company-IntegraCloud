// Rutas de la API. Se amplía por módulo a medida que se implementa
// (ver Backend-API/Controllers para el contrato completo).
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    MY_PERMISSIONS: '/auth/me/permissions',
    CHANGE_PASSWORD: '/auth/me/change-password',
  },
  companyBranding: (slug: string) => `/companies/branding/${slug}`,
  MENU: '/menu',

  COMPANIES: '/companies',
  company: (id: string) => `/companies/${id}`,
  companySuspend: (id: string) => `/companies/${id}/suspend`,
  companyActivate: (id: string) => `/companies/${id}/activate`,
  lookupRuc: (ruc: string) => `/lookup/ruc/${ruc}`,

  companyUsers: (companyId: string) => `/companies/${companyId}/users`,
  companyUser: (companyId: string, userId: string) => `/companies/${companyId}/users/${userId}`,
  companyUserRoles: (companyId: string, userId: string) => `/companies/${companyId}/users/${userId}/roles`,
  companyUserChangePassword: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}/change-password`,
  companyUserDeactivate: (companyId: string, userId: string) => `/companies/${companyId}/users/${userId}/deactivate`,
  companyUserReactivate: (companyId: string, userId: string) => `/companies/${companyId}/users/${userId}/reactivate`,

  companyRoles: (companyId: string) => `/companies/${companyId}/roles`,
} as const;
