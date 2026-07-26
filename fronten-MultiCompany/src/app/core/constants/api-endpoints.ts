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
  companyRoleTree: (companyId: string) => `/companies/${companyId}/roles/tree`,
  companyRole: (companyId: string, roleId: string) => `/companies/${companyId}/roles/${roleId}`,
  companyRolePermissions: (companyId: string, roleId: string) =>
    `/companies/${companyId}/roles/${roleId}/permissions`,

  PERMISSIONS: '/permissions',

  // ── ERP · Catálogo de productos ──
  ERP_PRODUCTS: '/erp/products',
  erpProduct: (id: string) => `/erp/products/${id}`,
  erpProductMedia: (id: string) => `/erp/products/${id}/media`,
  erpProductStatus: (id: string) => `/erp/products/${id}/status`,
  ERP_CATEGORIES: '/erp/categories',
  erpCategory: (id: string) => `/erp/categories/${id}`,
  ERP_SUBCATEGORIES: '/erp/subcategories',
  erpSubcategory: (id: string) => `/erp/subcategories/${id}`,
  ERP_BRANDS: '/erp/brands',
  erpBrand: (id: string) => `/erp/brands/${id}`,
  ERP_SUBBRANDS: '/erp/subbrands',
  erpSubbrand: (id: string) => `/erp/subbrands/${id}`,
  ERP_UNITS: '/erp/units',
  erpUnit: (id: string) => `/erp/units/${id}`,
  erpUnitStatus: (id: string) => `/erp/units/${id}/status`,
  ERP_PRICE_LISTS: '/erp/price-lists',
  erpPriceList: (id: string) => `/erp/price-lists/${id}`,
  erpPriceListStatus: (id: string) => `/erp/price-lists/${id}/status`,
  ERP_CURRENCIES: '/erp/currencies',
  erpCurrency: (id: string) => `/erp/currencies/${id}`,
  erpCurrencyStatus: (id: string) => `/erp/currencies/${id}/status`,
} as const;
